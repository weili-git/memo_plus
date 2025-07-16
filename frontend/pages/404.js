import Link from "next/link"

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", marginTop: 50}}>
      <h1>404</h1>
      <p>Page not found!</p>
      <Link href="/" className="btn">
        Go back to home
      </Link>
    </div>
  );
}