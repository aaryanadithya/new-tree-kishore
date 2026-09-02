import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

// mode: "edit" | "addChild" | "addSpouse"
export default function MemberFormModal({ mode, initial, onCancel, onSubmit }) {
  const [name, setName] = useState(initial?.name || "");
  const [gender, setGender] = useState(initial?.gender || "male");
  const [details, setDetails] = useState(initial?.details || "");
  const [photo, setPhoto] = useState(initial?.photo || "");
  const [birthDate, setBirthDate] = useState(initial?.birthDate || "");
  const [deathDate, setDeathDate] = useState(initial?.deathDate || "");
  const fileInputRef = useRef(null);

  const titles = {
    edit: "Edit Member",
    addChild: "Add Child",
    addSpouse: "Add Spouse",
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      gender,
      details: details.trim(),
      photo: photo.trim(),
      birthDate,
      deathDate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="animate-scaleIn relative w-full max-w-sm rounded-3xl border border-white/30 bg-white p-7 shadow-2xl dark:bg-slate-800"
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 text-slate-400 transition hover:text-slate-700 dark:hover:text-white"
        >
          <X size={20} />
        </button>

        <h3 className="mb-5 text-lg font-bold text-slate-800 dark:text-slate-100">
          {titles[mode]}
        </h3>

        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Name
        </label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className="mb-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        />

        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Gender
        </label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="mb-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Photo
        </label>
        <div className="mb-4 flex items-center gap-2">
          <input
            value={photo.startsWith("data:") ? "" : photo}
            onChange={(e) => setPhoto(e.target.value)}
            placeholder={photo.startsWith("data:") ? "Image uploaded" : "https://..."}
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload a photo"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Upload size={15} />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Born
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Died (if applicable)
            </label>
            <input
              type="date"
              value={deathDate}
              onChange={(e) => setDeathDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>
        </div>

        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Details
        </label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={3}
          placeholder="A short bio..."
          className="mb-6 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-primary-dark"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
