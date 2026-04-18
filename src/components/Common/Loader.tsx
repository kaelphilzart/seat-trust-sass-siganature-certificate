import React from "react";

const Loader = () => {
  return (
    <span
      className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-label="loading"
    ></span>
  );
};

export default Loader;
