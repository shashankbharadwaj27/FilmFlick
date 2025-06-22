import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { useSelector } from 'react-redux';

const Checkbox = forwardRef(({ checked, onChange, label }, ref) => {
    const checkboxRef = useRef();
    const darkMode = useSelector(state => state.darkMode.darkMode);

    return (
        <div>
            <input
                type="checkbox"
                ref={checkboxRef}
                checked={checked}
                onChange={onChange}
                className="h-5 w-5 text-blue-600 dark:text-blue-500 bg-gray-900 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-blue-500"
            />
            <label className={`mx-2 text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</label>
        </div>
    );
});

export default Checkbox;
