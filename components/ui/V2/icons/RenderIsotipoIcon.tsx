import React from "react";

function RenderIsotipoIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 21 21"
      className={className}
      {...props}
    >
      <path
        fill="#0D0D0D"
        d="M15.818.209a5.137 5.137 0 0 0-5.32 4.367c-.016.119-.039.233-.058.348-.598 3.182-3.381 5.591-6.725 5.591a6.8 6.8 0 0 1-3.287-.841.174.174 0 0 0-.26.153v10.998h10.269v-7.732a2.573 2.573 0 0 1 2.567-2.578h2.566c2.906 0 5.245-2.42 5.13-5.365C20.598 2.5 18.457.335 15.818.209"
      ></path>
    </svg>
  );
}

export default RenderIsotipoIcon;
