"use client";

import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../lib/getUsers";

const UsersList = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  return (
    <div>
      {data?.map((user) => {
        return (
          <div key={user.id}>
            <p>{user.email}</p>
          </div>
        );
      })}
    </div>
  );
};

export default UsersList;
