import { Link } from "@react-email/components";

const ACCENT_COLOR_PRIMARY = "#f29400";

const MyEmail = ({ email }) => {
  const href = `mailto:${email}`;
  return (
    <Link
      href={href}
      style={{
        color: ACCENT_COLOR_PRIMARY,
        textDecoration: "none",
      }}
    >
      {email}
    </Link>
  );
};

export default MyEmail;
