import React from "react";

function LoginSkeleton({ message = "Please wait..." }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center px-4">
            {/* Logo */}
            <div className="mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-16 h-16 animate-pulse">
                    <defs>
                        <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{stopColor:'#dc2626',stopOpacity:1}} />
                            <stop offset="100%" style={{stopColor:'#b91c1c',stopOpacity:1}} />
                        </linearGradient>
                    </defs>
                    <circle cx="32" cy="32" r="30" fill="url(#loaderGradient)" />
                    <polygon points="26,18 26,46 50,32" fill="white" />
                </svg>
            </div>

            {/* Spinner */}
            <div className="relative mb-6">
                <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>

            {/* Message */}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {message}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs">
                Setting up your experience. This won't take long.
            </p>

            {/* Animated dots */}
            <div className="flex gap-1.5 mt-6">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
        </div>
    );
}

export default LoginSkeleton;
