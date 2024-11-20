"use client";

import { FileIcon, X } from "lucide-react";
import Image from "next/image";

import { UploadDropzone } from "@/lib/uploadthing";
import { useState } from "react";

interface FileUploadProps {
  onChange: (fileData: { url: string; type: string }) => void;
  value: string;
  type: string;
  endpoint: "messageFile" | "serverImage";
}

export const FileUpload = ({
  onChange,
  value,
  type,
  endpoint,
}: FileUploadProps) => {
  const [fileName, setFileName] = useState<string | null>(null);

  if (value && type !== "pdf") {
    return (
      <div className="relative h-20 w-20">
        <Image 
          fill
          src={value}
          alt="Upload"
          className="rounded-full"
        />
        <button 
          onClick={() => onChange({ url: "", type: "" })}
          className="bg-rose-500 text-white p-1
          rounded-full absolute top-0 right-0 shadow-sm"
          type="button"
        >
          <X className="h-4 w-4"/>
        </button>
      </div>
    )
  }

  if (value && type === "pdf") {
    return (
      <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
        <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400"/>
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
        >
          {fileName}
        </a>
        <button 
           onClick={() => onChange({ url: "", type: "" })}
          className="bg-rose-500 text-white p-1
          rounded-full absolute -top-2 -right-2 shadow-sm"
          type="button"
        >
          <X className="h-4 w-4"/>
        </button>
      </div>
    )
  }

  return (
    <UploadDropzone 
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        const uploadedFile = res?.[0];
        setFileName(uploadedFile.name);
        onChange({ 
          url: uploadedFile.url, 
          type: uploadedFile.name.split(".").pop()
        });
      }}
      onUploadError={(error: Error) =>{
        alert(error);
      }}
    />
  );
};