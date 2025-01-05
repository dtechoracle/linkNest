import React, { useEffect, useState, useRef } from "react";
import { supabase } from "./lib/supabase";
import { LinkCard } from "./components/LinkCard";
import { AddLinkForm } from "./components/AddLinkForm";
import { AuthForm } from "./components/AuthForm";
import { PublicProfile } from "./components/PublicProfile";
import { User } from "@supabase/supabase-js";
import { Share2, Edit3, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Link = {
  id: string;
  url: string;
  title: string;
  display_order: number;
};

const THEME_COLORS = [
  { primary: "#FF6B6B", secondary: "#FFF3F3" },
  { primary: "#4ECDC4", secondary: "#F0FFFD" },
  { primary: "#45B7D1", secondary: "#E6F8FC" },
  { primary: "#96C93D", secondary: "#F5FAE9" },
  { primary: "#A78BFA", secondary: "#F5F3FF" },
  { primary: "#F7B731", secondary: "#FFF9E6" },
];

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ username: string } | null>(null);
  const [bio, setBio] = useState<string>("");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [theme, setTheme] = useState(THEME_COLORS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get username from URL path
  const username = window.location.pathname.slice(1);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchLinks(session.user.id);
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchLinks(session.user.id);
        fetchProfile(session.user.id);
      } else {
        setLinks([]);
        setProfile(null);
      }
    });
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("username, bio, theme")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }

    setProfile(data);
    setBio(data.bio || "");
    setTheme(data.theme || THEME_COLORS[0]);
  };

  const fetchLinks = async (userId: string) => {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("profile_id", userId)
      .order("display_order");

    if (error) {
      console.error("Error fetching links:", error);
      return;
    }

    setLinks(data || []);
  };

  const handleAddLink = async (url: string, title: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("links")
      .insert([
        {
          profile_id: user.id,
          url,
          title,
          display_order: links.length,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding link:", error);
      return;
    }

    setLinks([...links, data]);
  };

  const handleDeleteLink = async (id: string) => {
    const { error } = await supabase.from("links").delete().eq("id", id);

    if (error) {
      console.error("Error deleting link:", error);
      return;
    }

    setLinks(links.filter((link) => link.id !== id));
  };

  const handleSignOut = () => {
    supabase.auth.signOut();
  };

  const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || "?";
  };

  const handleShare = async () => {
    if (profile?.username) {
      const shareUrl = `${window.location.origin}/${profile.username}`;
      try {
        await navigator.share({
          title: `${profile.username}'s Links`,
          url: shareUrl,
        });
      } catch (err) {
        await navigator.clipboard.writeText(shareUrl);
        alert("Profile link copied to clipboard!");
      }
    }
  };

  const handleSaveBio = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ bio })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating bio:", error);
      return;
    }

    setIsEditingBio(false);
  };

  const handlePreview = () => {
    if (profile?.username) {
      navigate(`/${profile.username}`);
    }
  };

  const updateTheme = async (newTheme: (typeof THEME_COLORS)[0]) => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        theme: newTheme,
      })
      .eq("id", user.id);

    if (!error) {
      setTheme(newTheme);
    } else {
      console.error("Error updating theme:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <AuthForm />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ backgroundColor: theme.secondary }}
    >
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-20 border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-4 focus:outline-none"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105"
                style={{ backgroundColor: theme.primary }}
              >
                <span className="text-white font-semibold">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-12 left-0 w-48 bg-white rounded-lg shadow-lg py-1 z-30">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {profile?.username || user?.email}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleShare}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Share2 size={20} />
            <span>Share Profile</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 pb-24 px-4 max-w-2xl mx-auto">
        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: theme.primary }}
            >
              <span className="text-white text-2xl font-semibold">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl font-semibold">{profile?.username}</h2>
          </div>

          {/* Bio Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">Bio</h3>
              <button
                onClick={() => setIsEditingBio(!isEditingBio)}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              >
                <Edit3 size={16} />
                <span>{isEditingBio ? "Cancel" : "Edit"}</span>
              </button>
            </div>

            {isEditingBio ? (
              <div className="space-y-2">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Tell people about yourself..."
                />
                <button
                  onClick={handleSaveBio}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Bio
                </button>
              </div>
            ) : (
              <p className="text-gray-600">
                {bio || "Add a bio to tell people about yourself."}
              </p>
            )}
          </div>

          {/* Theme Selector */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Theme Color
            </h3>
            <div className="flex flex-wrap gap-2">
              {THEME_COLORS.map((color, index) => (
                <button
                  key={index}
                  onClick={() => updateTheme(color)}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none ${
                    theme.primary === color.primary
                      ? "ring-2 ring-offset-2 ring-gray-400"
                      : ""
                  }`}
                  style={{ backgroundColor: color.primary }}
                />
              ))}
            </div>
          </div>

          <AddLinkForm onAdd={handleAddLink} />
        </div>

        {/* Links Section */}
        <div className="space-y-3">
          {links.map((link) => (
            <LinkCard
              key={link.id}
              url={link.url}
              title={link.title}
              onDelete={() => handleDeleteLink(link.id)}
              isEditing={true}
              theme={theme}
            />
          ))}
        </div>
      </div>

      {/* Floating Preview Button */}
      <button
        onClick={() => navigate(`/${profile?.username}`)}
        className="fixed bottom-6 right-6 px-6 py-3 bg-black text-white rounded-full shadow-lg hover:shadow-xl transition-shadow z-20 flex items-center space-x-2"
      >
        <span>Preview Profile</span>
      </button>
    </div>
  );
}

export default App;
