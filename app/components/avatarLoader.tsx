import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar';
import { useState, useEffect, JSX } from "react";
import axios from "axios";
import { Link } from "react-router";
import { userInitials } from "~/utils/helpers";
interface AvatarLoaderProps {
  object: any;
  marginClass?: string;
  clickable?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  shape?: "circle" | "square";
}
export default function AvatarLoader({
  object,
  marginClass = "",
  clickable = false,
  size = "md",
  shape = "circle",
}: AvatarLoaderProps): JSX.Element {
  const [loading, setLoading] = useState(!object.user?.profile);
  const [profile, setProfile] = useState(object.user?.profile);
  const initials = userInitials(object.user);
  useEffect(() => {
    if (!profile) {
      setLoading(true);
      axios
        .get(`/api/users/${object.userId}`)
        .then((res) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          setProfile(res.data.profile);
        })
        .catch((err) => {
          console.error("error", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);
  if (loading) {
    return (
      <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center mr-8 shrink-0 grow-0"></div>
    );
  }
  const avatarImg = profile?.profileImage ? profile.profileImage : "";

  const sizeClasses = {
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-14 w-14",
    xl: "h-16 w-16",
    xxl: "h-20 w-20"
  };

  if(size == 'md'){
    marginClass += ' max-w-[60px]'
  }

  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-lg";

  if (avatarImg) {
    if (clickable) {
      return (
        <Link to={`/members/${object.userId}/content`}>
          <Avatar className={`${sizeClasses[size]} ${shapeClass} ${marginClass}`}>
            <AvatarImage src={avatarImg} alt="avatar" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Link>
      );
    } else {
      return (
        <Avatar className={`${sizeClasses[size]} ${shapeClass} ${marginClass}`}>
          <AvatarImage src={avatarImg} alt="avatar" />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      );
    }
  }

  return (
    <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center shrink-0 grow-0 mr-2">
      {loading || !profile?.fullName ? (
        ""
      ) : (
        <span className="text-white">{initials}</span>
      )}
    </div>
  );
}
