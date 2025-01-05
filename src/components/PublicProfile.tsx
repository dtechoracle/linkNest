import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { LinkCard } from "./LinkCard";
import { ShareButton } from "./ShareButton";

type ProfileData = {
  username: string;
  bio: string;
  id: string;
};

type Link = {
  id: string;
  url: string;
  title: string;
  display_order: number;
};

export const PublicProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) {
        navigate("/");
        return;
      }

      // First get the profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (profileError || !profileData) {
        console.error("Error fetching profile:", profileError);
        setLoading(false);
        navigate("/");
        return;
      }

      setProfile(profileData);

      // Then fetch the links for this profile
      const { data: linksData, error: linksError } = await supabase
        .from("links")
        .select("*")
        .eq("profile_id", profileData.id)
        .order("display_order");

      if (linksError) {
        console.error("Error fetching links:", linksError);
        setLoading(false);
        return;
      }

      setLinks(linksData || []);
      setLoading(false);
    };

    fetchProfile();
  }, [username, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 relative">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-md p-8 mb-6 text-center transform transition-all hover:shadow-lg relative">
          <div className="absolute top-4 right-4">
            <ShareButton
              url={window.location.href}
              title={`Check out ${profile.username}'s LinkNest profile`}
            />
          </div>

          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-4xl font-bold">
              {profile.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-3">@{profile.username}</h1>
          {profile.bio && (
            <p className="text-gray-600 mb-4 max-w-sm mx-auto">{profile.bio}</p>
          )}
        </div>

        <div className="space-y-4">
          {links.map((link) => (
            <div
              key={link.id}
              className="relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <LinkCard url={link.url} title={link.title} isEditing={false} />
              <div className="absolute top-3 right-3">
                <ShareButton url={link.url} title={link.title} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <a
        href="/signup"
        className="fixed bottom-6 right-6 bg-black text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        Create Your Profile
      </a>
    </div>
  );
};
