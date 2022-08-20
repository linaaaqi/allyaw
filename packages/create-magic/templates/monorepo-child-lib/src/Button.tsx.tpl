import React from "react";

interface IButton {
  /**
   * The button name.
   */
  name?: string;
}

const Button: React.FC<IButton> = () => {
  return (
    <div>
      <h1>Hello world</h1>
    </div>
  );
};

export default Button;
