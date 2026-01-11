export default function UserList({ users, statuses, startCall }) {
  return (
    <>
      {users.map((u) => (
        <div key={u._id} className="user-row">
          <span>{u.fullName}</span>

          <span
            className={`status ${statuses[u._id]}`}
          >
            {statuses[u._id] || "offline"}
          </span>

          <button
            disabled={statuses[u._id] !== "online"}
            onClick={() => startCall(u._id)}
          >
            Call
          </button>
        </div>
      ))}
    </>
  );
}