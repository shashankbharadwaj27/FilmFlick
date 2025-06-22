import React, { useRef } from "react";

const Input = React.forwardRef((props, ref) => {
    const inputRef = useRef();

    // Expose methods to the parent component using the ref
    React.useImperativeHandle(ref, () => ({
        getText: () => inputRef.current.value,
        clearText: () => {
            inputRef.current.value = '';
        }
    }));

    return (
        <input
            ref={inputRef}
            placeholder="Add a comment..."
            className="w-full p-2 border rounded-md"
        />
    );
});

export default Input;
