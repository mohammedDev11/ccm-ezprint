// "use client";

// import React, { useRef, useState } from "react";
// import { motion } from "motion/react";
// import { IconUpload } from "@tabler/icons-react";
// import { useDropzone } from "react-dropzone";
// import { cn } from "@/lib/cn";

// const mainVariant = {
//   initial: {
//     x: 0,
//     y: 0,
//   },
//   animate: {
//     x: 18,
//     y: -18,
//     opacity: 0.95,
//   },
// };

// const secondaryVariant = {
//   initial: {
//     opacity: 0,
//     scale: 0.98,
//   },
//   animate: {
//     opacity: 1,
//     scale: 1,
//   },
// };

// type FileUploadProps = {
//   onChange?: (files: File[]) => void;
// };

// export const FileUpload = ({ onChange }: FileUploadProps) => {
//   const [files, setFiles] = useState<File[]>([]);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const handleFileChange = (newFiles: File[]) => {
//     setFiles((prevFiles) => [...prevFiles, ...newFiles]);
//     onChange?.(newFiles);
//   };

//   const handleClick = () => {
//     fileInputRef.current?.click();
//   };

//   const { getRootProps, isDragActive } = useDropzone({
//     multiple: false,
//     noClick: true,
//     onDrop: handleFileChange,
//     onDropRejected: (error) => {
//       console.log(error);
//     },
//   });

//   return (
//     <div className="w-full" {...getRootProps()}>
//       <motion.div
//         onClick={handleClick}
//         whileHover="animate"
//         className={cn(
//           "group/file card relative block w-full cursor-pointer overflow-hidden rounded-md p-6 md:p-8",
//           "transition-colors duration-200"
//         )}
//       >
//         <input
//           ref={fileInputRef}
//           id="file-upload-handle"
//           type="file"
//           onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
//           className="hidden"
//         />

//         <div className="absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
//           <GridPattern />
//         </div>

//         <div
//           className={cn(
//             "absolute inset-0 transition-all duration-200",
//             isDragActive ? "opacity-100" : "opacity-0"
//           )}
//           style={{
//             background:
//               "linear-gradient(180deg, rgba(55,125,255,0.06) 0%, rgba(55,125,255,0.02) 100%)",
//           }}
//         />

//         <div className="relative z-10 flex flex-col items-center justify-center text-center">
//           {/* <p className="relative z-20 font-sans text-base font-bold text-neutral-700 dark:text-neutral-300">
//             Upload file
//           </p>
//           <p className="relative z-20 mt-2 font-sans text-base font-normal text-neutral-400 dark:text-neutral-400">
//             Drag or drop your files here or click to upload
//           </p> */}

//           <p className="title-md text-base sm:text-lg">Upload file</p>

//           <p className="paragraph mt-2 max-w-md text-sm sm:text-base">
//             Drag and drop your file here or click to upload
//           </p>

//           <div className="relative mx-auto mt-8 w-full max-w-xl">
//             {files.length > 0 &&
//               files.map((file, idx) => (
//                 <motion.div
//                   key={`file-${idx}`}
//                   layoutId={idx === 0 ? "file-upload" : `file-upload-${idx}`}
//                   className={cn(
//                     "card relative z-40 mx-auto mt-4 flex w-full flex-col items-start justify-start overflow-hidden rounded-md p-4 md:h-24"
//                   )}
//                 >
//                   <div className="flex w-full items-center justify-between gap-4">
//                     <motion.p
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       layout
//                       className="max-w-xs truncate text-sm font-medium sm:text-base"
//                       style={{ color: "var(--title)" }}
//                     >
//                       {file.name}
//                     </motion.p>

//                     <motion.p
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       layout
//                       className="shrink-0 rounded-md px-2.5 py-1 text-xs font-medium sm:text-sm"
//                       style={{
//                         background: "var(--surface-2)",
//                         color: "var(--paragraph)",
//                         border: "1px solid var(--border)",
//                       }}
//                     >
//                       {(file.size / (1024 * 1024)).toFixed(2)} MB
//                     </motion.p>
//                   </div>

//                   <div
//                     className="mt-2 flex w-full flex-col items-start justify-between gap-2 text-xs sm:text-sm md:flex-row md:items-center"
//                     style={{ color: "var(--muted)" }}
//                   >
//                     <motion.p
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       layout
//                       className="rounded-md px-2 py-1"
//                       style={{
//                         background: "var(--surface-2)",
//                         color: "var(--paragraph)",
//                         border: "1px solid var(--border)",
//                       }}
//                     >
//                       {file.type || "Unknown type"}
//                     </motion.p>

//                     <motion.p
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       layout
//                     >
//                       Modified{" "}
//                       {new Date(file.lastModified).toLocaleDateString()}
//                     </motion.p>
//                   </div>
//                 </motion.div>
//               ))}

//             {!files.length && (
//               <motion.div
//                 layoutId="file-upload"
//                 variants={mainVariant}
//                 transition={{
//                   type: "spring",
//                   stiffness: 300,
//                   damping: 20,
//                 }}
//                 className={cn(
//                   "relative z-40 mx-auto mt-4 flex h-32 w-full max-w-[8rem] items-center justify-center rounded-md border",
//                   "group-hover/file:shadow-lg"
//                 )}
//                 style={{
//                   background: "var(--surface)",
//                   borderColor: "var(--border)",
//                   boxShadow: "0 10px 30px rgba(var(--shadow-color), 0.08)",
//                 }}
//               >
//                 {isDragActive ? (
//                   <motion.p
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     className="flex flex-col items-center gap-2 text-sm font-medium"
//                     style={{ color: "var(--brand-500)" }}
//                   >
//                     <span style={{ color: "var(--paragraph)" }}>Drop it</span>
//                     <IconUpload
//                       className="h-5 w-5"
//                       style={{ color: "var(--color-brand-500)" }}
//                     />
//                   </motion.p>
//                 ) : (
//                   <IconUpload
//                     className="h-5 w-5"
//                     style={{ color: "var(--color-brand-500)" }}
//                   />
//                 )}
//               </motion.div>
//             )}

//             {!files.length && (
//               <motion.div
//                 variants={secondaryVariant}
//                 className="absolute inset-0 z-30 mx-auto mt-4 flex h-32 w-full max-w-[8rem] items-center justify-center rounded-md border border-dashed"
//                 style={{
//                   borderColor: "var(--color-brand-400)",
//                   background: "transparent",
//                 }}
//               />
//             )}
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export function GridPattern() {
//   const columns = 41;
//   const rows = 11;

//   return (
//     <div
//       className="flex shrink-0 scale-105 flex-wrap items-center justify-center gap-x-px gap-y-px"
//       style={{ background: "var(--surface-2)" }}
//     >
//       {Array.from({ length: rows }).map((_, row) =>
//         Array.from({ length: columns }).map((_, col) => {
//           const index = row * columns + col;

//           return (
//             <div
//               key={`${col}-${row}`}
//               className="h-10 w-10 shrink-0 rounded-[2px]"
//               style={{
//                 background:
//                   index % 2 === 0 ? "var(--surface)" : "var(--surface)",
//                 boxShadow:
//                   index % 2 === 0
//                     ? "none"
//                     : "inset 0 0 0 1px rgba(55,125,255,0.06)",
//               }}
//             />
//           );
//         })
//       )}
//     </div>
//   );
// }

//======================working===================
// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { motion } from "motion/react";
// import {
//   IconEye,
//   IconPlus,
//   IconTrash,
//   IconUpload,
//   IconX,
// } from "@tabler/icons-react";
// import { useDropzone, type Accept } from "react-dropzone";
// import { cn } from "@/lib/cn";

// const mainVariant = {
//   initial: {
//     x: 0,
//     y: 0,
//   },
//   animate: {
//     x: 18,
//     y: -18,
//     opacity: 0.95,
//   },
// };

// const secondaryVariant = {
//   initial: {
//     opacity: 0,
//     scale: 0.98,
//   },
//   animate: {
//     opacity: 1,
//     scale: 1,
//   },
// };

// type FileUploadProps = {
//   value?: File[];
//   onChange?: (files: File[]) => void;
//   multiple?: boolean;
//   accept?: Accept;
//   maxFiles?: number;
//   disabled?: boolean;
//   className?: string;
//   title?: string;
//   description?: string;
//   showPreview?: boolean;
//   showRemove?: boolean;
//   showClearAll?: boolean;
// };

// const getFileId = (file: File) =>
//   `${file.name}-${file.size}-${file.lastModified}-${file.type}`;

// export const FileUpload = ({
//   value,
//   onChange,
//   multiple = true,
//   accept,
//   maxFiles,
//   disabled = false,
//   className,
//   title = "Upload file",
//   description = "Drag and drop your file here or click to upload",
//   showPreview = true,
//   showRemove = true,
//   showClearAll = true,
// }: FileUploadProps) => {
//   const [internalFiles, setInternalFiles] = useState<File[]>([]);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const isControlled = value !== undefined;
//   const files = isControlled ? value : internalFiles;

//   const updateFiles = (nextFiles: File[]) => {
//     if (!isControlled) {
//       setInternalFiles(nextFiles);
//     }
//     onChange?.(nextFiles);
//   };

//   const mergedAccept = useMemo(() => accept, [accept]);

//   const mergeFiles = (currentFiles: File[], newFiles: File[]) => {
//     const fileMap = new Map<string, File>();

//     currentFiles.forEach((file) => {
//       fileMap.set(getFileId(file), file);
//     });

//     newFiles.forEach((file) => {
//       fileMap.set(getFileId(file), file);
//     });

//     let merged = Array.from(fileMap.values());

//     if (!multiple && merged.length > 1) {
//       merged = [merged[merged.length - 1]];
//     }

//     if (typeof maxFiles === "number") {
//       merged = merged.slice(0, maxFiles);
//     }

//     return merged;
//   };

//   const handleFileChange = (newFiles: File[]) => {
//     if (!newFiles.length) return;
//     const nextFiles = mergeFiles(files, newFiles);
//     updateFiles(nextFiles);
//   };

//   const removeFile = (targetFile: File) => {
//     const targetId = getFileId(targetFile);
//     const nextFiles = files.filter((file) => getFileId(file) !== targetId);
//     updateFiles(nextFiles);
//   };

//   const clearFiles = () => {
//     updateFiles([]);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   const previewFile = (file: File) => {
//     const url = URL.createObjectURL(file);
//     window.open(url, "_blank", "noopener,noreferrer");

//     setTimeout(() => {
//       URL.revokeObjectURL(url);
//     }, 1000);
//   };

//   const handleClick = () => {
//     if (disabled) return;
//     fileInputRef.current?.click();
//   };

//   const { getRootProps, isDragActive } = useDropzone({
//     multiple,
//     noClick: true,
//     disabled,
//     accept: mergedAccept,
//     onDrop: handleFileChange,
//     onDropRejected: (error) => {
//       console.log(error);
//     },
//   });

//   useEffect(() => {
//     if (!isControlled) return;
//     setInternalFiles(value ?? []);
//   }, [isControlled, value]);

//   return (
//     <div
//       className={cn(
//         "mx-auto w-full lg:w-[90%] xl:w-[90%] 2xl:w-[90%]",
//         className
//       )}
//       {...getRootProps()}
//     >
//       <motion.div
//         onClick={handleClick}
//         whileHover={disabled ? undefined : "animate"}
//         className={cn(
//           "group/file card relative block w-full overflow-hidden rounded-2xl px-4 py-6 sm:px-6 sm:py-8 md:px-8",
//           disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
//           "transition-colors duration-200"
//         )}
//       >
//         <input
//           ref={fileInputRef}
//           id="file-upload-handle"
//           type="file"
//           multiple={multiple}
//           accept={buildAcceptString(mergedAccept)}
//           onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
//           className="hidden"
//           disabled={disabled}
//         />

//         <div className="absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
//           <GridPattern />
//         </div>

//         <div
//           className={cn(
//             "absolute inset-0 transition-all duration-200",
//             isDragActive ? "opacity-100" : "opacity-0"
//           )}
//           style={{
//             background:
//               "linear-gradient(180deg, rgba(55,125,255,0.06) 0%, rgba(55,125,255,0.02) 100%)",
//           }}
//         />

//         <div className="relative z-10 flex flex-col items-center justify-center text-center">
//           <p className="title-md text-base sm:text-lg">{title}</p>

//           <p className="paragraph mt-2 max-w-md text-sm sm:text-base">
//             {description}
//           </p>

//           {files.length > 0 && (
//             <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
//               <button
//                 type="button"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleClick();
//                 }}
//                 className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition"
//                 style={{
//                   background: "var(--color-brand-500)",
//                   color: "#ffffff",
//                   border: "1px solid transparent",
//                 }}
//               >
//                 <IconPlus size={16} />
//                 Add more files
//               </button>

//               {showClearAll && (
//                 <button
//                   type="button"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     clearFiles();
//                   }}
//                   className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition"
//                   style={{
//                     background: "var(--surface-2)",
//                     color: "var(--foreground)",
//                     border: "1px solid var(--border)",
//                   }}
//                 >
//                   <IconX size={16} />
//                   Clear all
//                 </button>
//               )}
//             </div>
//           )}

//           <div className="relative mx-auto mt-8 w-full max-w-2xl">
//             {files.length > 0 && (
//               <p
//                 className="mb-4 text-center text-sm"
//                 style={{ color: "var(--muted)" }}
//               >
//                 You can also click anywhere in this box to add more files.
//               </p>
//             )}

//             {files.length > 0 &&
//               files.map((file, idx) => (
//                 <motion.div
//                   key={getFileId(file)}
//                   layoutId={idx === 0 ? "file-upload" : `file-upload-${idx}`}
//                   className="card relative z-40 mx-auto mt-4 flex w-full flex-col items-start justify-start overflow-hidden rounded-md p-4"
//                 >
//                   <div className="flex w-full items-start justify-between gap-4">
//                     <div className="min-w-0 flex-1">
//                       <motion.p
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         layout
//                         className="truncate text-sm font-medium sm:text-base"
//                         style={{ color: "var(--title)" }}
//                       >
//                         {file.name}
//                       </motion.p>

//                       <div
//                         className="mt-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm"
//                         style={{ color: "var(--muted)" }}
//                       >
//                         <motion.p
//                           initial={{ opacity: 0 }}
//                           animate={{ opacity: 1 }}
//                           layout
//                           className="rounded-md px-2 py-1"
//                           style={{
//                             background: "var(--surface-2)",
//                             color: "var(--paragraph)",
//                             border: "1px solid var(--border)",
//                           }}
//                         >
//                           {file.type || "Unknown type"}
//                         </motion.p>

//                         <motion.p
//                           initial={{ opacity: 0 }}
//                           animate={{ opacity: 1 }}
//                           layout
//                           className="shrink-0 rounded-md px-2.5 py-1 font-medium"
//                           style={{
//                             background: "var(--surface-2)",
//                             color: "var(--paragraph)",
//                             border: "1px solid var(--border)",
//                           }}
//                         >
//                           {(file.size / (1024 * 1024)).toFixed(2)} MB
//                         </motion.p>

//                         <motion.p
//                           initial={{ opacity: 0 }}
//                           animate={{ opacity: 1 }}
//                           layout
//                         >
//                           Modified{" "}
//                           {new Date(file.lastModified).toLocaleDateString()}
//                         </motion.p>
//                       </div>
//                     </div>

//                     <div className="flex shrink-0 items-center gap-2">
//                       {showPreview && (
//                         <button
//                           type="button"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             previewFile(file);
//                           }}
//                           className="flex h-9 w-9 items-center justify-center rounded-md transition"
//                           title="Preview file"
//                           style={{
//                             background: "var(--surface-2)",
//                             color: "var(--foreground)",
//                             border: "1px solid var(--border)",
//                           }}
//                         >
//                           <IconEye size={18} />
//                         </button>
//                       )}

//                       {showRemove && (
//                         <button
//                           type="button"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             removeFile(file);
//                           }}
//                           className="flex h-9 w-9 items-center justify-center rounded-md transition"
//                           title="Remove file"
//                           style={{
//                             background: "var(--surface-2)",
//                             color: "var(--foreground)",
//                             border: "1px solid var(--border)",
//                           }}
//                         >
//                           <IconTrash size={18} />
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}

//             {!files.length && (
//               <motion.div
//                 layoutId="file-upload"
//                 variants={mainVariant}
//                 transition={{
//                   type: "spring",
//                   stiffness: 300,
//                   damping: 20,
//                 }}
//                 className={cn(
//                   "relative z-40 mx-auto mt-4 flex h-28 w-full max-w-[7rem] items-center justify-center rounded-md border sm:h-32 sm:max-w-[8rem]",
//                   "group-hover/file:shadow-lg"
//                 )}
//                 style={{
//                   background: "var(--surface)",
//                   borderColor: "var(--border)",
//                   boxShadow: "0 10px 30px rgba(var(--shadow-color), 0.08)",
//                 }}
//               >
//                 {isDragActive ? (
//                   <motion.p
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     className="flex flex-col items-center gap-2 text-sm font-medium"
//                     style={{ color: "var(--color-brand-500)" }}
//                   >
//                     <span style={{ color: "var(--paragraph)" }}>Drop it</span>
//                     <IconUpload
//                       className="h-5 w-5"
//                       style={{ color: "var(--color-brand-500)" }}
//                     />
//                   </motion.p>
//                 ) : (
//                   <IconUpload
//                     className="h-5 w-5"
//                     style={{ color: "var(--color-brand-500)" }}
//                   />
//                 )}
//               </motion.div>
//             )}

//             {!files.length && (
//               <motion.div
//                 variants={secondaryVariant}
//                 className="absolute inset-0 z-30 mx-auto mt-4 flex h-28 w-full max-w-[7rem] items-center justify-center rounded-md border border-dashed sm:h-32 sm:max-w-[8rem]"
//                 style={{
//                   borderColor: "var(--color-brand-400)",
//                   background: "transparent",
//                 }}
//               />
//             )}
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// function buildAcceptString(accept?: Accept) {
//   if (!accept) return undefined;

//   const parts: string[] = [];

//   Object.entries(accept).forEach(([mimeType, extensions]) => {
//     parts.push(mimeType);
//     if (extensions?.length) {
//       parts.push(...extensions);
//     }
//   });

//   return parts.join(",");
// }

// export function GridPattern() {
//   const columns = 41;
//   const rows = 11;

//   return (
//     <div
//       className="flex shrink-0 scale-105 flex-wrap items-center justify-center gap-x-px gap-y-px"
//       style={{ background: "var(--surface-2)" }}
//     >
//       {Array.from({ length: rows }).map((_, row) =>
//         Array.from({ length: columns }).map((_, col) => {
//           const index = row * columns + col;

//           return (
//             <div
//               key={`${col}-${row}`}
//               className="h-10 w-10 shrink-0 rounded-[2px]"
//               style={{
//                 background: "var(--surface)",
//                 boxShadow:
//                   index % 2 === 0
//                     ? "none"
//                     : "inset 0 0 0 1px rgba(55,125,255,0.06)",
//               }}
//             />
//           );
//         })
//       )}
//     </div>
//   );
// }

//==============NEW========================
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  IconFile,
  IconPlus,
  IconUpload,
  IconX,
  IconChecks,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { useDropzone, type Accept } from "react-dropzone";
import { cn } from "@/lib/cn";
import ExpandedButton from "../button/ExpandedButton";
import Button from "../button/Button";

const mainVariant = {
  initial: { x: 0, y: 0 },
  animate: { x: 18, y: -18, opacity: 0.95 },
};

const secondaryVariant = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
};

const previewFileAction = {
  label: "Preview",
  icon: IconUpload,
};

const deleteFileAction = {
  label: "Delete",
  icon: IconX,
};

type FileUploadProps = {
  value?: File[];
  onChange?: (files: File[]) => void;
  onReject?: (message: string) => void;
  multiple?: boolean;
  accept?: Accept;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
  title?: string;
  description?: string;
  showPreview?: boolean;
  showRemove?: boolean;
  showClearAll?: boolean;
  draftKey?: string;
  showDraftActions?: boolean;
  emptyHelperText?: string;
};

type DraftFileMeta = {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  savedAt: string;
};

type DraftPayload = {
  files: DraftFileMeta[];
  updatedAt: string;
};

const getFileId = (file: File) =>
  `${file.name}-${file.size}-${file.lastModified}-${file.type}`;

export const FileUpload = ({
  value,
  onChange,
  onReject,
  multiple = true,
  accept,
  maxFiles,
  disabled = false,
  className,
  title = "Upload files",
  description = "Drag and drop your files here or click to browse your device.",
  showPreview = true,
  showRemove = true,
  showClearAll = true,
  draftKey = "ezprint-upload-draft",
  showDraftActions = true,
  emptyHelperText = "PDF, DOCX, PPTX, or images. Clean, fast, and easy for users.",
}: FileUploadProps) => {
  const [internalFiles, setInternalFiles] = useState<File[]>([]);
  const [draftMeta, setDraftMeta] = useState<DraftPayload | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isControlled = value !== undefined;
  const files = isControlled ? value : internalFiles;

  const updateFiles = (nextFiles: File[]) => {
    if (!isControlled) {
      setInternalFiles(nextFiles);
    }
    onChange?.(nextFiles);
  };

  const mergedAccept = useMemo(() => accept, [accept]);

  const mergeFiles = (currentFiles: File[], newFiles: File[]) => {
    const fileMap = new Map<string, File>();

    currentFiles.forEach((file) => {
      fileMap.set(getFileId(file), file);
    });

    newFiles.forEach((file) => {
      fileMap.set(getFileId(file), file);
    });

    let merged = Array.from(fileMap.values());

    if (!multiple && merged.length > 1) {
      merged = [merged[merged.length - 1]];
    }

    if (typeof maxFiles === "number") {
      merged = merged.slice(0, maxFiles);
    }

    return merged;
  };

  const handleFileChange = (newFiles: File[]) => {
    if (!newFiles.length) return;
    const nextFiles = mergeFiles(files, newFiles);
    updateFiles(nextFiles);
    setDraftSaved(false);
  };

  const removeFile = (targetFile: File) => {
    const targetId = getFileId(targetFile);
    const nextFiles = files.filter((file) => getFileId(file) !== targetId);
    updateFiles(nextFiles);
    setDraftSaved(false);
  };

  const clearFiles = () => {
    updateFiles([]);
    setDraftSaved(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const previewFile = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank", "noopener,noreferrer");

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1500);
  };

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const saveDraft = () => {
    if (!files.length) return;

    const payload: DraftPayload = {
      updatedAt: new Date().toISOString(),
      files: files.map((file) => ({
        id: getFileId(file),
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        savedAt: new Date().toISOString(),
      })),
    };

    localStorage.setItem(draftKey, JSON.stringify(payload));
    setDraftMeta(payload);
    setDraftSaved(true);

    setTimeout(() => {
      setDraftSaved(false);
    }, 1800);
  };

  const clearDraftMeta = () => {
    localStorage.removeItem(draftKey);
    setDraftMeta(null);
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple,
    noClick: true,
    disabled,
    accept: mergedAccept,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
      onReject?.("Only PDF files can be uploaded. Unsupported files were removed.");
    },
  });

  useEffect(() => {
    if (!showDraftActions) return;

    const timer = window.setTimeout(() => {
      const raw = localStorage.getItem(draftKey);

      if (!raw) {
        return;
      }

      try {
        const parsed = JSON.parse(raw) as DraftPayload;
        setDraftMeta(parsed);
      } catch {
        setDraftMeta(null);
      }
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [draftKey, showDraftActions]);

  return (
    <div
      className={cn(
        "mx-auto w-full lg:w-[90%] xl:w-[90%] 2xl:w-[90%]",
        className
      )}
      {...getRootProps()}
    >
      <motion.div
        whileHover={disabled ? undefined : "animate"}
        className={cn(
          "group/file card relative block w-full overflow-hidden rounded-2xl px-4 py-5 sm:px-6 sm:py-6 md:px-8",
          disabled ? "cursor-not-allowed opacity-70" : "cursor-default",
          "transition-colors duration-200"
        )}
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          multiple={multiple}
          accept={buildAcceptString(mergedAccept)}
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
          disabled={disabled}
        />

        <div className="absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <GridPattern />
        </div>

        <div
          className={cn(
            "absolute inset-0 transition-all duration-200",
            isDragActive ? "opacity-100" : "opacity-0"
          )}
          style={{
            background:
              "linear-gradient(180deg, rgba(55,125,255,0.08) 0%, rgba(55,125,255,0.03) 100%)",
          }}
        />

        <div className="relative z-10">
          {/* Top Bar */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="title-md text-base sm:text-lg">{title}</p>
              <p className="paragraph mt-2 max-w-2xl text-sm sm:text-base">
                {description}
              </p>

              {showDraftActions && draftMeta && !files.length && (
                <div
                  className="mt-3 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: "var(--paragraph)",
                  }}
                >
                  <IconDeviceFloppy size={16} />
                  Draft found with {draftMeta.files.length} file
                  {draftMeta.files.length > 1 ? "s" : ""}
                </div>
              )}
            </div>

            {files.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                <Button
                  type="button"
                  onClick={handleClick}
                  variant="primary"
                  size="sm"
                  iconLeft={<IconPlus size={16} />}
                >
                  Add files
                </Button>

                {showDraftActions && (
                  <Button
                    type="button"
                    onClick={saveDraft}
                    disabled={!files.length}
                    variant="secondary"
                    size="sm"
                    iconLeft={
                      draftSaved ? (
                        <IconChecks size={16} />
                      ) : (
                        <IconDeviceFloppy size={16} />
                      )
                    }
                  >
                    {draftSaved ? "Saved" : "Save draft"}
                  </Button>
                )}

                {showClearAll && files.length > 0 && (
                  <Button
                    type="button"
                    onClick={clearFiles}
                    variant="secondary"
                    size="sm"
                    iconLeft={<IconX size={16} />}
                  >
                    Clear all
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Draft Info */}
          {showDraftActions && draftMeta && (
            <div
              className="mb-5 flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="min-w-0">
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--title)" }}
                >
                  Draft memory
                </p>
                <p className="text-sm" style={{ color: "var(--paragraph)" }}>
                  Last saved {new Date(draftMeta.updatedAt).toLocaleString()} —{" "}
                  {draftMeta.files.length} file
                  {draftMeta.files.length > 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleClick}
                  className="btn-secondary"
                >
                  Replace with new files
                </button>

                <button
                  type="button"
                  onClick={clearDraftMeta}
                  className="btn-secondary"
                >
                  Remove draft info
                </button>
              </div>
            </div>
          )}

          {/* Empty / Filled */}
          <div className="relative mx-auto w-full max-w-3xl">
            {!files.length && (
              <>
                <motion.div
                  onClick={handleClick}
                  layoutId="file-upload"
                  variants={mainVariant}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className={cn(
                    "relative z-40 mx-auto mt-4 flex h-32 w-32 items-center justify-center rounded-2xl border sm:h-36 sm:w-36",
                    disabled ? "cursor-not-allowed" : "cursor-pointer",
                    "group-hover/file:shadow-lg"
                  )}
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                    boxShadow: "0 10px 30px rgba(var(--shadow-color), 0.08)",
                  }}
                >
                  {isDragActive ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center gap-2 text-sm font-medium"
                      style={{ color: "var(--color-brand-500)" }}
                    >
                      <span style={{ color: "var(--paragraph)" }}>
                        Drop files
                      </span>
                      <IconUpload
                        className="h-5 w-5"
                        style={{ color: "var(--color-brand-500)" }}
                      />
                    </motion.p>
                  ) : (
                    <IconUpload
                      className="h-6 w-6"
                      style={{ color: "var(--color-brand-500)" }}
                    />
                  )}
                </motion.div>

                <motion.div
                  variants={secondaryVariant}
                  className="absolute left-1/2 top-4 z-30 flex -translate-x-1/2 items-center justify-center rounded-2xl border border-dashed sm:h-36 sm:w-36"
                  style={{
                    borderColor: "var(--color-brand-400)",
                    background: "transparent",
                    width: "9rem",
                    height: "8rem",
                  }}
                />

                <div className="mt-8 text-center">
                  <p className="text-sm" style={{ color: "var(--paragraph)" }}>
                    {emptyHelperText}
                  </p>
                </div>
              </>
            )}

            {files.length > 0 && (
              <>
                <div className="mb-4 text-center">
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    Tap a file to review it, preview it, delete it, or save your
                    progress as a draft.
                  </p>
                </div>

                <div className="space-y-4">
                  {files.map((file, idx) => {
                    return (
                      <motion.div
                        key={getFileId(file)}
                        layoutId={
                          idx === 0 ? "file-upload" : `file-upload-${idx}`
                        }
                        className="card relative z-40 mx-auto flex w-full flex-col gap-4 overflow-hidden rounded-2xl p-4 sm:p-5"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex min-w-0 flex-1 gap-3">
                            <div
                              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                              style={{
                                background: "var(--surface-2)",
                                border: "1px solid var(--border)",
                                color: "var(--color-brand-500)",
                              }}
                            >
                              <IconFile size={22} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p
                                className="truncate text-sm font-semibold sm:text-base"
                                style={{ color: "var(--title)" }}
                              >
                                {file.name}
                              </p>

                              <div
                                className="mt-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm"
                                style={{ color: "var(--muted)" }}
                              >
                                <span
                                  className="rounded-md px-2 py-1"
                                  style={{
                                    background: "var(--surface-2)",
                                    color: "var(--paragraph)",
                                    border: "1px solid var(--border)",
                                  }}
                                >
                                  {file.type || "Unknown type"}
                                </span>

                                <span
                                  className="rounded-md px-2.5 py-1 font-medium"
                                  style={{
                                    background: "var(--surface-2)",
                                    color: "var(--paragraph)",
                                    border: "1px solid var(--border)",
                                  }}
                                >
                                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </span>

                                <span>
                                  Modified{" "}
                                  {new Date(
                                    file.lastModified
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">
                            {showPreview && (
                              <ExpandedButton
                                id={`preview-${getFileId(file)}`}
                                label={previewFileAction.label}
                                icon={previewFileAction.icon}
                                variant="surface"
                                onClick={(e) => {
                                  e?.stopPropagation?.();
                                  previewFile(file);
                                }}
                              />
                            )}

                            {showRemove && (
                              <ExpandedButton
                                id={`delete-${getFileId(file)}`}
                                label={deleteFileAction.label}
                                icon={deleteFileAction.icon}
                                variant="danger"
                                onClick={(e) => {
                                  e?.stopPropagation?.();
                                  removeFile(file);
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

function buildAcceptString(accept?: Accept) {
  if (!accept) return undefined;

  const parts: string[] = [];

  Object.entries(accept).forEach(([mimeType, extensions]) => {
    parts.push(mimeType);
    if (extensions?.length) {
      parts.push(...extensions);
    }
  });

  return parts.join(",");
}

export function GridPattern() {
  const columns = 41;
  const rows = 11;

  return (
    <div
      className="flex shrink-0 scale-105 flex-wrap items-center justify-center gap-x-px gap-y-px"
      style={{ background: "var(--surface-2)" }}
    >
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;

          return (
            <div
              key={`${col}-${row}`}
              className="h-10 w-10 shrink-0 rounded-[2px]"
              style={{
                background: "var(--surface)",
                boxShadow:
                  index % 2 === 0
                    ? "none"
                    : "inset 0 0 0 1px rgba(55,125,255,0.06)",
              }}
            />
          );
        })
      )}
    </div>
  );
}
