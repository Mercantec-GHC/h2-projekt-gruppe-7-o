using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

public class DevelopmentOnlyFilter : IActionFilter
{
    private readonly IHostEnvironment _env;
    public DevelopmentOnlyFilter(IHostEnvironment env) => _env = env;

    public void OnActionExecuting(ActionExecutingContext context)
    {
        if (!_env.IsDevelopment())
        {
            // Return 404 to avoid exposing the existence of the endpoint
            context.Result = new NotFoundResult();
        }
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
    }
}