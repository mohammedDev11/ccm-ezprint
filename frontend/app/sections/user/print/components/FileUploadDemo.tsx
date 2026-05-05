// "use client";

// import { FileUpload } from "@/components/ui/button/file-upload";
// import React, { useState } from "react";

// export function FileUploadDemo() {
//   const [files, setFiles] = useState<File[]>([]);

//   const handleFileUpload = (files: File[]) => {
//     setFiles(files);
//     console.log(files);
//   };

//   return (
//     // <div
//     //   className="card mx-auto w-full max-w-4xl rounded-md border border-dashed p-4 sm:p-6"
//     //   style={{
//     //     background: "var(--surface)",
//     //     borderColor: "var(--border)",
//     //   }}
//     // >
//     <div>
//       <FileUpload onChange={handleFileUpload} />
//     </div>
//   );
// }

"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/button/file-upload";

export function FileUploadDemo() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div>
      <FileUpload value={files} onChange={setFiles} multiple maxFiles={10} />
    </div>
  );
}
