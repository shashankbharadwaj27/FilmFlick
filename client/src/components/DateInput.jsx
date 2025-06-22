import React, { forwardRef, useImperativeHandle, useRef } from 'react';

const DateInput = forwardRef(({ value, onChange, min, max }, ref) => {
    const dateInputRef = useRef();

    useImperativeHandle(ref, () => ({
        getDate: () => dateInputRef.current.value,
        reset: () => { dateInputRef.current.value = ''; },
    }));

    return (
        <input
            type="date"
            ref={dateInputRef}
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            className="w-full p-2 border rounded-lg shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
    );
});

export default DateInput;
