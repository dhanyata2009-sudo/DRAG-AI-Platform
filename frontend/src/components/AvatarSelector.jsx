import React, { useEffect, useState } from "react";
import { Check, Loader2, UserRound } from "lucide-react";
import api from "../services/api";

const AvatarSelector = ({ selectedAvatar, onSelect }) => {
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAvatars();
  }, []);

  const fetchAvatars = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/avatars");

      const data = response.data;

      if (Array.isArray(data)) {
        setAvatars(data);
      } else if (Array.isArray(data.avatars)) {
        setAvatars(data.avatars);
      } else {
        setAvatars([]);
      }
    } catch (err) {
      console.error("Failed to load avatars:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load avatars. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getAvatarKey = (avatar) => {
  if (!avatar) return null;

  return (
    avatar.id ||
    avatar.replica_id ||
    avatar.avatar_id ||
    avatar._id ||
    avatar.name ||
    null
  );
};

  const selectedKey = getAvatarKey(selectedAvatar);

  const handleSelect = (avatar) => {
    onSelect(avatar);
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex items-center gap-3 text-[#8b6547]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading avatars...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="mb-4 text-sm text-red-600">{error}</p>

        <button
          onClick={fetchAvatars}
          className="rounded-xl bg-[#8b6547] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#76543b]"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (avatars.length === 0) {
    return (
      <div className="rounded-2xl border border-[#ded2c5] bg-[#faf7f2] p-8 text-center">
        <UserRound className="mx-auto mb-3 h-8 w-8 text-[#8b6547]" />

        <p className="text-sm text-[#6f6258]">
          No avatars are available.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#2f2924]">
          Choose Your Avatar
        </h2>

        <p className="mt-1 text-sm text-[#7b6d61]">
          Select the AI creator who will present your advertisement.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {avatars.map((avatar) => {
          const avatarKey = getAvatarKey(avatar);

          const isSelected =
            Boolean(avatarKey) &&
            Boolean(selectedKey) &&
            avatarKey === selectedKey;

          return (
            <button
              key={avatarKey}
              type="button"
              onClick={() => handleSelect(avatar)}
              className={`group relative overflow-hidden rounded-2xl border-2 bg-white text-left transition-all duration-200 ${
                isSelected
                  ? "border-[#8b6547] shadow-lg shadow-[#8b6547]/10"
                  : "border-[#e4d9ce] hover:border-[#b99b7d] hover:shadow-md"
              }`}
            >
              {/* Avatar Image */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f3eee8]">
                <img
  src={avatar.thumbnailUrl || avatar.image_url || ""}
  alt={avatar.name || "AI Presenter"}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />

                {/* Selected Badge */}
                {isSelected && (
                  <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-[#8b6547] px-3 py-1.5 text-xs font-semibold text-white shadow-md">
                    <Check className="h-3.5 w-3.5" />
                    Selected
                  </div>
                )}
              </div>

              {/* Avatar Information */}
              <div className="p-4">
                <h3 className="font-semibold text-[#302923]">
                  {avatar.name}
                </h3>

                {avatar.category && (
                  <p className="mt-1 text-sm text-[#817267]">
                    {avatar.category}
                  </p>
                )}

                <div
                  className={`mt-4 w-full rounded-xl px-4 py-2.5 text-center text-sm font-medium transition ${
                    isSelected
                      ? "bg-[#8b6547] text-white"
                      : "bg-[#f1e9e1] text-[#6f5038] group-hover:bg-[#e7d9ca]"
                  }`}
                >
                  {isSelected ? "Selected Avatar" : "Select Avatar"}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AvatarSelector;