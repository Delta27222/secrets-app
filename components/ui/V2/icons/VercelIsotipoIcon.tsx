import React from "react";

function VercelIsotipoIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 26 23"
      className={className}
      {...props}
    >
      <path fill="#000" d="m12.744.5 12.702 22H.041z"></path>
    </svg>
  );
}

export default VercelIsotipoIcon;
