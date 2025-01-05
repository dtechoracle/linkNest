import React, { useState } from "react";
import { Plus } from "lucide-react";

type AddLinkFormProps = {
  onAdd: (url: string, title: string) => void;
};

export const AddLinkForm: React.FC<AddLinkFormProps> = ({ onAdd }) => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      onAdd(url, title);
      setUrl("");
      setTitle("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mb-6">
      <div>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL"
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Custom title (optional)"
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <button
        type="submit"
        className="w-full flex items-center justify-center space-x-2 bg-black text-white p-2 rounded-full hover:bg-white hover:text-black hover:border hover:border-black transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Add Link</span>
      </button>
    </form>
  );
};
