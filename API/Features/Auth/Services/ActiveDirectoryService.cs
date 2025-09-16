using System.DirectoryServices.Protocols;
using System.Text;
using System.Net;

namespace API.Services
{
    /// <summary>
    /// Service til håndtering af Active Directory autentificering og brugerinformation
    /// </summary>
    public class ActiveDirectoryService
    {
        private readonly ILogger<ActiveDirectoryService> _logger;
        private readonly IConfiguration _configuration;

        // AD konfiguration fra appsettings.json
        private readonly string _server;
        private readonly string _username;
        private readonly string _password;
        private readonly string _domain;
        private readonly int _port;
        private readonly bool _useSSL;
        private readonly int _connectionTimeout;
        private readonly int _maxRetries;
        private readonly int _retryDelayMs;

        /// <summary>
        /// Initialiserer en ny instans af ActiveDirectoryService
        /// </summary>
        /// <param name="logger">Logger til fejlrapportering</param>
        /// <param name="configuration">Konfiguration til AD indstillinger</param>
        public ActiveDirectoryService(ILogger<ActiveDirectoryService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;

            // Læs AD konfiguration fra appsettings.json
            _server = _configuration["ActiveDirectory:Server"] ?? "10.133.71.113";
            _domain = _configuration["ActiveDirectory:Domain"] ?? "kabdikhan.local";
            _username = _configuration["ActiveDirectory:ReaderUsername"] ?? "adReader";
            _password = _configuration["ActiveDirectory:ReaderPassword"] ?? "Merc1234!";
            _port = int.Parse(_configuration["ActiveDirectory:Port"] ?? "389");
            _useSSL = bool.Parse(_configuration["ActiveDirectory:UseSSL"] ?? "false");
            _connectionTimeout = int.Parse(_configuration["ActiveDirectory:ConnectionTimeout"] ?? "30");
            _maxRetries = int.Parse(_configuration["ActiveDirectory:MaxRetries"] ?? "3");
            _retryDelayMs = int.Parse(_configuration["ActiveDirectory:RetryDelayMs"] ?? "1000");
        }

        /// <summary>
        /// Autentificerer en bruger mod Active Directory
        /// </summary>
        /// <param name="username">Brugernavn (kan være email eller sAMAccountName)</param>
        /// <param name="password">Adgangskode</param>
        /// <returns>ADUserInfo med brugerinformation hvis autentificering lykkes, ellers null</returns>
        public async Task<ADUserInfo?> AuthenticateUserAsync(string username, string password)
        {
            for (int attempt = 1; attempt <= _maxRetries; attempt++)
            {
                try
                {
                    _logger.LogInformation("Forsøger AD autentificering for bruger: {Username} (forsøg {Attempt}/{MaxRetries})",
                        username, attempt, _maxRetries);

                    // Test service account connection først
                    if (!await TestServiceAccountConnectionAsync())
                    {
                        _logger.LogError("Service konto forbindelse fejlede");
                        return null;
                    }

                    // Opret LDAP forbindelse med timeout
                    using var connection = new LdapConnection(new LdapDirectoryIdentifier(_server, _port));

                    // Konfigurer forbindelse
                    connection.SessionOptions.ProtocolVersion = 3;
                    connection.SessionOptions.SecureSocketLayer = _useSSL;
                    connection.SessionOptions.VerifyServerCertificate = (conn, cert) => true;
                    connection.Timeout = TimeSpan.FromSeconds(_connectionTimeout);

                    // BIND MED SERVICE KONTO FØRST - PRØV FORSKILLIGE FORMATTER
                    var serviceCredentials = new[]
                    {
                        new NetworkCredential(_username, _password, _domain),
                        new NetworkCredential($"{_domain}\\{_username}", _password),
                        new NetworkCredential($"{_username}@{_domain}", _password)
                    };

                    bool serviceBound = false;
                    foreach (var cred in serviceCredentials)
                    {
                        try
                        {
                            connection.Credential = cred;
                            await Task.Run(() => connection.Bind());
                            serviceBound = true;
                            _logger.LogInformation("Service konto bind succesfuldt med format: {Username}", cred.UserName);
                            break;
                        }
                        catch (LdapException ex)
                        {
                            _logger.LogInformation("Service konto bind fejlede med format {Format}: {Error}", cred.UserName, ex.Message);
                        }
                    }

                    if (!serviceBound)
                    {
                        _logger.LogError("Alle service konto bind forsøg fejlede");
                        return null;
                    }

                    // Søg efter brugeren i AD
                    var userInfo = await SearchUserInADAsync(connection, username);

                    if (userInfo == null)
                    {
                        _logger.LogWarning("Bruger {Username} ikke fundet i AD", username);
                        return null;
                    }

                    // TEST BRUGERENS CREDENTIALS MED SEPARAT FORBINDELSE
                    using var userConnection = new LdapConnection(new LdapDirectoryIdentifier(_server, _port));
                    userConnection.SessionOptions.ProtocolVersion = 3;
                    userConnection.SessionOptions.SecureSocketLayer = _useSSL;
                    userConnection.SessionOptions.VerifyServerCertificate = (conn, cert) => true;
                    userConnection.Timeout = TimeSpan.FromSeconds(_connectionTimeout);

                    // Prøv forskellige credential formater for slutbrugeren
                    var userCredentials = new[]
                    {
                        new NetworkCredential(userInfo.SamAccountName, password, _domain),
                        new NetworkCredential($"{_domain}\\{userInfo.SamAccountName}", password),
                        new NetworkCredential($"{userInfo.SamAccountName}@{_domain}", password),
                        new NetworkCredential(username, password, _domain), // Original username format
                        new NetworkCredential($"{_domain}\\{username}", password),
                        new NetworkCredential($"{username}@{_domain}", password)
                    };

                    bool userBound = false;
                    foreach (var userCred in userCredentials)
                    {
                        try
                        {
                            var success = await Task.Run(() =>
                            {
                                try
                                {
                                    userConnection.Credential = userCred;
                                    userConnection.Bind(); // LDAP bind
                                    return true;
                                }
                                catch (LdapException ex)
                                {
                                    _logger.LogInformation("Bruger bind fejlede med format {Format}: {Error}", userCred.UserName, ex.Message);
                                    return false;
                                }
                            });

                            if (success)
                            {
                                userBound = true;
                                _logger.LogInformation("Bruger bind succesfuldt med format: {Format}", userCred.UserName);
                                break;
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Uventet fejl under AD bind for {Username}", userCred.UserName);
                        }
                    }

                    if (!userBound)
                    {
                        _logger.LogWarning("Alle bruger credential forsøg fejlede for: {Username}", username);
                        return null;
                    }


                    _logger.LogInformation("AD autentificering succesfuldt for bruger: {Username}", username);
                    return userInfo;
                }
                catch (LdapException ex)
                {
                    var errorMessage = GetLDAPErrorMessage(ex.ErrorCode);
                    _logger.LogError(ex, "LDAP fejl ved autentificering af bruger: {Username}. Error: {ErrorCode} - {ErrorMessage} (forsøg {Attempt}/{MaxRetries})",
                        username, ex.ErrorCode, errorMessage, attempt, _maxRetries);

                    if (attempt < _maxRetries)
                    {
                        await Task.Delay(_retryDelayMs * attempt);
                        continue;
                    }
                    return null;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Generel fejl ved AD autentificering for bruger: {Username} (forsøg {Attempt}/{MaxRetries})",
                        username, attempt, _maxRetries);

                    if (attempt < _maxRetries)
                    {
                        await Task.Delay(_retryDelayMs * attempt);
                        continue;
                    }
                    return null;
                }
            }

            return null;
        }

        /// <summary>
        /// Tester service konto forbindelse
        /// </summary>
        private async Task<bool> TestServiceAccountConnectionAsync()
        {
            try
            {
                using var connection = new LdapConnection(new LdapDirectoryIdentifier(_server, _port));
                connection.SessionOptions.ProtocolVersion = 3;
                connection.SessionOptions.SecureSocketLayer = _useSSL;
                connection.SessionOptions.VerifyServerCertificate = (conn, cert) => true;
                connection.Timeout = TimeSpan.FromSeconds(10);

                // Prøv forskellige credential formater
                var credentials = new[]
                {
                    new NetworkCredential(_username, _password, _domain),
                    new NetworkCredential($"{_domain}\\{_username}", _password),
                    new NetworkCredential($"{_username}@{_domain}", _password)
                };

                foreach (var cred in credentials)
                {
                    try
                    {
                        connection.Credential = cred;
                        await Task.Run(() => connection.Bind());
                        _logger.LogInformation("Service konto test succesfuldt med format: {Format}", cred.UserName);
                        return true;
                    }
                    catch (LdapException ex)
                    {
                        _logger.LogWarning("Service konto test fejlede med format {Format}: {Error}", cred.UserName, ex.Message);
                    }
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Generel fejl ved service konto test");
                return false;
            }
        }

        /// <summary>
        /// Søger efter en bruger i Active Directory
        /// </summary>
        /// <param name="connection">LDAP forbindelse</param>
        /// <param name="username">Brugernavn eller email at søge efter</param>
        /// <returns>ADUserInfo hvis brugeren findes, ellers null</returns>
        private async Task<ADUserInfo?> SearchUserInADAsync(LdapConnection connection, string username)
        {
            try
            {
                
                var baseDn = $"DC={_domain.Replace(".", ",DC=")}";

                var searchFilter = $"(|(sAMAccountName={username})(mail={username})(userPrincipalName={username}))";
                var searchRequest = new SearchRequest(
                    baseDn, 
                    searchFilter,
                    SearchScope.Subtree,
                    "sAMAccountName", "mail", "displayName", "givenName", "sn", "memberOf", "userPrincipalName"
                );

                var searchResponse = await Task.Run(() => (SearchResponse)connection.SendRequest(searchRequest));

                if (searchResponse.Entries.Count == 0)
                {
                    _logger.LogWarning("Ingen bruger fundet i AD for: {Username}", username);
                    return null;
                }

                var entry = searchResponse.Entries[0];

                var userInfo = new ADUserInfo
                {
                    SamAccountName = GetAttributeValue(entry, "sAMAccountName"),
                    Email = GetAttributeValue(entry, "mail"),
                    DisplayName = GetAttributeValue(entry, "displayName"),
                    FirstName = GetAttributeValue(entry, "givenName"),
                    LastName = GetAttributeValue(entry, "sn"),
                    UserPrincipalName = GetAttributeValue(entry, "userPrincipalName"),
                    Groups = GetGroupMemberships(entry)
                };

                _logger.LogInformation("Bruger fundet i AD: {SamAccountName}", userInfo.SamAccountName);
                return userInfo;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Fejl ved søgning i AD for bruger: {Username}", username);
                return null;
            }
        }

        /// <summary>
        /// Henter værdien af et attribut fra en AD entry
        /// </summary>
        private string GetAttributeValue(SearchResultEntry entry, string attributeName)
        {
            if (entry.Attributes[attributeName] != null && entry.Attributes[attributeName].Count > 0)
            {
                return entry.Attributes[attributeName][0].ToString() ?? string.Empty;
            }
            return string.Empty;
        }

        /// <summary>
        /// Henter gruppemedlemskaber fra en AD entry
        /// </summary>
        private List<string> GetGroupMemberships(SearchResultEntry entry)
        {
            var groups = new List<string>();

            if (entry.Attributes["memberOf"] != null)
            {
                foreach (var group in entry.Attributes["memberOf"])
                {
                    var groupDn = group.ToString();
                    if (!string.IsNullOrEmpty(groupDn))
                    {
                        var cnIndex = groupDn.IndexOf("CN=", StringComparison.OrdinalIgnoreCase);
                        if (cnIndex >= 0)
                        {
                            var cnEnd = groupDn.IndexOf(",", cnIndex);
                            if (cnEnd > cnIndex)
                            {
                                var groupName = groupDn.Substring(cnIndex + 3, cnEnd - cnIndex - 3);
                                groups.Add(groupName);
                            }
                            else
                            {
                                var groupName = groupDn.Substring(cnIndex + 3);
                                groups.Add(groupName);
                            }
                        }
                    }
                }
            }

            return groups;
        }

        /// <summary>
        /// Tester LDAP forbindelse til AD server
        /// </summary>
        /// <returns>True hvis LDAP forbindelsen virker, ellers false</returns>
        public async Task<bool> TestLDAPConnectionAsync()
        {
            try
            {
                _logger.LogInformation("Tester LDAP forbindelse til AD server {Server}:{Port}", _server, _port);

                // Prøv først med standard konfiguration
                if (await TryLDAPConnectionAsync(_server, _port, _useSSL))
                {
                    return true;
                }

                // Prøv alternativ port hvis standard fejler
                if (_port == 389 && !_useSSL)
                {
                    _logger.LogInformation("Prøver alternativ LDAP forbindelse på port 636 med SSL");
                    if (await TryLDAPConnectionAsync(_server, 636, true))
                    {
                        return true;
                    }
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Generel fejl ved LDAP forbindelse til AD server {Server}:{Port}", _server, _port);
                return false;
            }
        }

        /// <summary>
        /// Prøver en specifik LDAP forbindelse
        /// </summary>
        private async Task<bool> TryLDAPConnectionAsync(string server, int port, bool useSSL)
        {
            try
            {
                _logger.LogInformation("Prøver LDAP forbindelse til {Server}:{Port} (SSL: {UseSSL})", server, port, useSSL);

                using var connection = new LdapConnection(new LdapDirectoryIdentifier(server, port));
                connection.SessionOptions.ProtocolVersion = 3;
                connection.SessionOptions.SecureSocketLayer = useSSL;
                connection.SessionOptions.VerifyServerCertificate = (conn, cert) => true;
                connection.Timeout = TimeSpan.FromSeconds(10); // Kortere timeout for test

                var networkCredential = new NetworkCredential(_username, _password, _domain);
                connection.Credential = networkCredential;

                await Task.Run(() => connection.Bind());

                _logger.LogInformation("LDAP forbindelse til {Server}:{Port} (SSL: {UseSSL}) succesfuldt", server, port, useSSL);
                return true;
            }
            catch (LdapException ex)
            {
                _logger.LogWarning("LDAP forbindelse fejlede til {Server}:{Port} (SSL: {UseSSL}). Error: {ErrorCode}",
                    server, port, useSSL, ex.ErrorCode);
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Fejl ved LDAP forbindelse til {Server}:{Port} (SSL: {UseSSL}): {Message}",
                    server, port, useSSL, ex.Message);
                return false;
            }
        }

        /// <summary>
        /// Konverterer LDAP fejlkoder til læsbare fejlmeddelelser
        /// </summary>
        /// <param name="errorCode">LDAP fejl kode</param>
        /// <returns>Læsbar fejlmeddelelse</returns>
        private string GetLDAPErrorMessage(int errorCode)
        {
            return errorCode switch
            {
                49 => "Invalid Credentials - Forkert brugernavn eller adgangskode",
                81 => "Server Down - AD serveren er nede",
                52 => "Local Error - Klient fejl",
                _ => $"LDAP Error Code: {errorCode}"
            };
        }



        /// <summary>
        /// Mapper AD grupper til applikationsroller
        /// </summary>
        /// <param name="adGroups">Liste af AD grupper</param>
        /// <returns>Applikationsrolle navn</returns>
        public string MapADGroupToRole(List<string> adGroups)
        {
            // Mapping logik - tilpas efter jeres AD gruppestruktur
            if (adGroups.Any(g => g.Contains("Admin", StringComparison.OrdinalIgnoreCase) ||
                                 g.Contains("Administrator", StringComparison.OrdinalIgnoreCase)))
            {
                return "Admin";
            }

            if (adGroups.Any(g => g.Contains("Manager", StringComparison.OrdinalIgnoreCase)))
            {
                return "Manager";
            }

            if (adGroups.Any(g => g.Contains("Receptionist", StringComparison.OrdinalIgnoreCase) ||
                                 g.Contains("Reception", StringComparison.OrdinalIgnoreCase)))
            {
                return "Receptionist";
            }

            if (adGroups.Any(g => g.Contains("User", StringComparison.OrdinalIgnoreCase)))
            {
                return "User";
            }

            // Default rolle for AD brugere er Receptionist
            return "Receptionist";
        }
    }





    /// <summary>
    /// Model til AD brugerinformation
    /// </summary>
    public class ADUserInfo
    {
        public string SamAccountName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string UserPrincipalName { get; set; } = string.Empty;
        public List<string> Groups { get; set; } = new List<string>();
    }
}