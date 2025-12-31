
import React, { useState } from "react";
import { Controller } from "react-hook-form";
import { FaCamera } from "react-icons/fa";

function GetImagePreview({
    name,
    control,
    label,
    defaultValue = "",
    className,
    cameraIcon = false,
    cameraSize = 20,
    image
}) {
    const [preview, setPreview] = useState(null);

    const handlePreview = (e) => {
        const files = e.target.files;
        setPreview(URL.createObjectURL(files[0]));
        return files;
    };
    // Radial gradient SVG as fallback
    const isAvatar = name === "avatar";
    const isCover = name === "coverImage";
    const showDefault = !(preview || image);
    const defaultGradient = isAvatar
        ? (
            <svg width="100%" height="100%" viewBox="0 0 100 100" className={className} style={{position:'absolute',top:0,left:0}}>
                <circle cx="50" cy="50" r="50" fill="#fff" />
            </svg>
        )
        : isCover
        ? (
            <svg width="100%" height="100%" viewBox="0 0 100 100" className={className} style={{position:'absolute',top:0,left:0}}>
                <rect width="100" height="100" fill="#000" />
            </svg>
        ) : null;
    return (
        <div className="w-full">
            <label
                htmlFor={name}
                className="cursor-pointer relative flex flex-col justify-center items-start sm:items-center"
            >
                {label && (
                    <span className="inline-block mb-2 pl-1 text-base sm:text-lg">{label}</span>
                )}
                <div className="relative flex justify-center items-center w-full">
                    <div className="absolute w-full h-full flex items-center justify-center">
                        {showDefault && defaultGradient}
                    </div>
                    <img
                        src={preview || image}
                        className={
                            className ||
                            "w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-lg border border-gray-300 bg-gray-100 transition-all duration-200 shadow-sm"
                        }
                        alt="preview"
                        style={showDefault ? {opacity:0} : {}}
                    />
                    {cameraIcon && (
                        <FaCamera
                            size={cameraSize}
                            className="hover:text-purple-500 absolute bottom-2 right-2 bg-black/80 rounded-full p-1 text-lg sm:text-xl shadow-md"
                        />
                    )}
                </div>
                <Controller
                    name={name}
                    control={control}
                    defaultValue={defaultValue || ""}
                    render={({ field: { onChange } }) => (
                        <input
                            id={name}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                onChange(handlePreview(e));
                            }}
                        />
                    )}
                    rules={{ required: `${name} is required` }}
                />
            </label>
        </div>
    );
}

export default GetImagePreview;
