import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { To, useLocation, useResolvedPath, useNavigate } from "react-router-dom";

// I would almost always use an anchor tag and href for usable navigation, but because
// this is a sort of "injected extension" of the page, we can't make use of the browser
// location/navigation. So we're using buttons with a memory router instead.

type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

type Props = Omit<ButtonProps, "className"> & {
  to: To;
  className?: (args: { isActive: boolean }) => string;
};

export function NavButton({ to, className, type, onClick, ...buttonProps }: Props) {
  const navigate = useNavigate();
  const path = useResolvedPath(to);
  const location = useLocation();

  const toPathname = path.pathname;
  const locationPathname = location.pathname;

  // https://github.com/remix-run/react-router/blob/main/packages/react-router-dom/index.tsx#L572-L576
  const isActive =
    locationPathname === toPathname ||
    (locationPathname.startsWith(toPathname) && locationPathname.charAt(toPathname.length) === "/");

  return (
    <button
      type={type || "button"}
      className={className?.({ isActive })}
      onClick={(event) => {
        navigate(to);
        onClick?.(event);
      }}
      {...buttonProps}
    />
  );
}
