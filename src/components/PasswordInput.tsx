'use client';

import { useState, InputHTMLAttributes } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { UseFormRegister, RegisterOptions, FieldValues } from 'react-hook-form';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
    errorMessage?: string;
    minLength?: number;
    showHelperText?: boolean;
    register?: UseFormRegister<FieldValues>;
    registerName?: string;
    registerOptions?: RegisterOptions;
}

const PasswordInput = ({
    id,
    className = '',
    error = false,
    errorMessage,
    minLength,
    showHelperText = true,
    register,
    registerName,
    registerOptions,
    ...props
}: PasswordInputProps) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Default styling based on the app's design
    const defaultClassName = `w-full p-3 border ${error ? 'border-red-500' : 'border-black dark:border-white'
        } rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white bg-white dark:bg-black`;

    // Combine default and custom classes
    const inputClassName = className || defaultClassName;

    // Prepare props based on whether we're using react-hook-form
    const inputProps = register && registerName
        ? { ...register(registerName, registerOptions), ...props }
        : props;

    return (
        <div className="relative">
            <input
                type={showPassword ? 'text' : 'password'}
                id={id}
                className={`${inputClassName} pr-10`}
                {...inputProps}
            />
            <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                style={{
                    height: '20px',
                    width: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
                {showPassword ? (
                    <EyeSlashIcon style={{ width: '16px', height: '16px' }} />
                ) : (
                    <EyeIcon style={{ width: '16px', height: '16px' }} />
                )}
            </button>
            {error && errorMessage && (
                <p className="mt-1 text-red-500">{errorMessage}</p>
            )}
            {showHelperText && minLength && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Must be at least {minLength} characters
                </p>
            )}
        </div>
    );
};

export default PasswordInput; 