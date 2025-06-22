import React, { useRef } from "react";

const TextArea = React.forwardRef((props, ref) => {
    const textAreaRef = useRef();

    // Expose methods to the parent component using the ref
    React.useImperativeHandle(ref, () => ({
        getText: () => textAreaRef.current.value,
        clearText: () => {
            textAreaRef.current.value = '';
        }
    }));

    return (
        <textarea
            ref={textAreaRef}
            onChange={props.onChange}
            placeholder={[props.placeholder]}
            className="w-full p-2 border rounded-md text-gray-800"
            rows={props.rows || 3}
            cols={props.columns || 30}
            value={props.text}
        />
    );
});

export default TextArea;
