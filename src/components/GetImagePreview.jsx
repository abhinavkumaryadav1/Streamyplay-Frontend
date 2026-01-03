
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
    image,
    required = true
}) {
    const [preview, setPreview] = useState(null);

    const handlePreview = (e) => {
        const files = e.target.files;
        if (files && files[0]) {
            setPreview(URL.createObjectURL(files[0]));
            return files;
        }
        return null;
    };

    const isAvatar = name === "avatar";
    const isCover = name === "coverImage";
    const showDefault = !(preview || image);

    return (
        <Controller
            name={name}
            control={control}
            defaultValue={defaultValue || ""}
            rules={required ? { required: `${name} is required` } : {}}
            render={({ field: { onChange } }) => (
                <label
                    htmlFor={name}
                    className={`cursor-pointer relative block ${
                        isCover ? "w-full h-full" : ""
                    }`}
                >
                    {label && (
                        <span className="inline-block mb-2 pl-1 text-base sm:text-lg text-gray-700">{label}</span>
                    )}
                    
                    {/* Image container */}
                    <div className={`relative ${
                        isCover ? "w-full h-full" : "inline-block"
                    }`}>
                        {/* Default placeholder for avatar */}
                        {isAvatar && showDefault && (
                            <div className={`${className} bg-gray-300 flex items-center justify-center`}>
                                <FaCamera className="text-gray-500" size={cameraSize} />
                            </div>
                        )}
                        
                        {/* Default placeholder for cover */}
                        {isCover && showDefault && (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <div className="flex flex-col items-center text-gray-400">
                                    <FaCamera size={24} />
                                    <span className="text-xs mt-1">Add Cover</span>
                                </div>
                            </div>
                        )}
                        
                        {/* Actual image preview */}
                        {!showDefault && (
                            <img
                                src={preview || image}
                                className={className || "w-32 h-32 object-cover rounded-lg"}
                                alt="preview"
                            />
                        )}
                        
                        {/* Camera icon overlay */}
                        {cameraIcon && !showDefault && (
                            <div className="absolute bottom-1 right-1 bg-black/60 rounded-full p-1.5 hover:bg-red-600 transition-colors">
                                <FaCamera
                                    size={cameraSize - 6}
                                    className="text-white"
                                />
                            </div>
                        )}
                    </div>
                    
                    <input
                        id={name}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const files = handlePreview(e);
                            if (files) onChange(files);
                        }}
                    />
                </label>
            )}
        />
    );
}

export default GetImagePreview;
