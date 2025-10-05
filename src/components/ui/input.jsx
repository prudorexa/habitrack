export function Input({ ...props }) {
  return (
    <input
      {...props}
      className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${props.className || ""}`}
    />
  );
}
