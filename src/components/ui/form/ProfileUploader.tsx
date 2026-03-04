import Image from "next/image";
import { Camera, Trash2, User } from "lucide-react";
import { ChangeEvent } from "react";

interface ProfileUploaderProps {
  previewUrl: string;
  onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onDelete: () => void;
}

export default function ProfileUploader({ previewUrl, onImageChange, onDelete }: ProfileUploaderProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 bg-zinc-800 group cursor-pointer">
          {previewUrl ? (
            <Image src={previewUrl} alt="profile" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-500">
              <User size={48} />
            </div>
          )}
          <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <Camera className="text-white" />
            <input type="file" accept="image/*" onChange={onImageChange} className="hidden" />
          </label>
        </div>
        {previewUrl && (
          <button
            type="button"
            onClick={onDelete}
            className="absolute -bottom-1 -right-1 p-2 bg-red-500/90 text-white rounded-full shadow-lg hover:bg-red-600 transition"
            title="사진 삭제"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <p className="text-xs text-zinc-500 mt-3">이미지를 클릭하여 등록하세요.(선택)</p>
    </div>
  );
}