import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  updateUserRole,
  deleteUser,
} from "../api/adminApi";
import "../styles/admin.css";
import toast from "react-hot-toast";        

export default function AdminUsers() {
  const queryClient = useQueryClient(); 

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, page],
    queryFn: async () => {
      const res = await getUsers(search, page);
      return res.data;
    },
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }) => updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
    toast.success("Role updated successfully");
    },
    onError: () => {
      toast.error("Failed to update role");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
    toast.success("User deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete user");
    },
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="admin-users">
      <h1>Users Management</h1>

      <input
        type="text"
        placeholder="Search by email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-box"
      />

      <table className="users-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Change Role</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {data?.users?.map((user) => (
            <tr key={user._id}>
              <td>{user.email}</td>
              <td>{user.role}</td>

              <td>
                <select
                  defaultValue={user.role}
                  onChange={(e) =>
                    updateRole.mutate({
                      id: user._id,
                      role: e.target.value,
                    })
                  }
                >
                  <option value="learner">Learner</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </td>

              <td>
                <button
                  className="delete-btn"
                  onClick={() => {
                    if (confirm("Are you sure?")) {
                      deleteMutation.mutate(user._id);
                    }
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>

        <span>
          Page {data?.page || 1} of {data?.pages || 1}
        </span>

        <button
          disabled={page === (data?.pages || 1)}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}