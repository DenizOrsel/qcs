import React from "react";

const Loader = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <svg
        version="1.1"
        id="Layer_1"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        viewBox="0 0 100 100"
        style={{ width: "20%", height: "20%" }}
      >
        <rect
          className="fill-black dark:fill-white"
          width="3"
          height="100"
          transform="translate(0) rotate(180 3 50)"
        >
          <animate
            attributeName="height"
            attributeType="XML"
            dur="1s"
            values="30; 100; 30"
            repeatCount="indefinite"
          />
        </rect>
        <rect
          x="17"
          className="fill-black dark:fill-white"
          width="3"
          height="100"
          transform="translate(0) rotate(180 20 50)"
        >
          <animate
            attributeName="height"
            attributeType="XML"
            dur="1s"
            values="30; 100; 30"
            repeatCount="indefinite"
            begin="0.1s"
          />
        </rect>
        <rect
          x="40"
          className="fill-black dark:fill-white"
          width="3"
          height="100"
          transform="translate(0) rotate(180 40 50)"
        >
          <animate
            attributeName="height"
            attributeType="XML"
            dur="1s"
            values="30; 100; 30"
            repeatCount="indefinite"
            begin="0.3s"
          />
        </rect>
        <rect
          x="60"
          className="fill-black dark:fill-white"
          width="3"
          height="100"
          transform="translate(0) rotate(180 58 50)"
        >
          <animate
            attributeName="height"
            attributeType="XML"
            dur="1s"
            values="30; 100; 30"
            repeatCount="indefinite"
            begin="0.5s"
          />
        </rect>
        <rect
          x="80"
          className="fill-black dark:fill-white"
          width="3"
          height="100"
          transform="translate(0) rotate(180 76 50)"
        >
          <animate
            attributeName="height"
            attributeType="XML"
            dur="1s"
            values="30; 100; 30"
            repeatCount="indefinite"
            begin="0.1s"
          />
        </rect>
      </svg>
    </div>
  );
};

export default Loader;
