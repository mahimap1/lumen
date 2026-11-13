import React from "react";
import {
  ChevronDown,
  GraduationCap,
  Briefcase,
  Wrench,
  Check
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";

// The header title doubles as the topic switcher: it shows the active topic and
// opens the grouped Classes / Career / Skills list to change it.
export default function TopicPicker({
  title,
  track,
  tracks = [],
  selectedTrackId = "",
  onSelectTrack
}) {
  const classTracks = tracks.filter((t) => (t.type || "course") === "course");
  const careerTracks = tracks.filter((t) => t.type === "career");
  const skillTracks = tracks.filter((t) => t.type === "skill" || t.type === "credential");

  const activeIcon =
    track?.type === "career" ? (
      <Briefcase className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
    ) : track?.type === "skill" || track?.type === "credential" ? (
      <Wrench className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
    ) : (
      <GraduationCap className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
    );

  const renderItem = (t) => (
    <DropdownMenuItem
      key={t.id}
      onClick={() => onSelectTrack && onSelectTrack(t.id)}
      className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs flex items-center justify-between hover:bg-zinc-800 focus:bg-zinc-800 ${
        selectedTrackId === t.id ? "bg-zinc-800 text-yellow-400 font-semibold" : "text-zinc-300"
      }`}
    >
      <div className="flex items-center gap-2 truncate">
        <span className="text-sm">{t.icon || "📘"}</span>
        <span className="truncate">
          {t.code} - {t.name}
        </span>
      </div>
      {selectedTrackId === t.id && (
        <Check className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 ml-2" />
      )}
    </DropdownMenuItem>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title="Change topic"
          className="flex items-center gap-2 max-w-full truncate px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/70 border border-transparent hover:border-zinc-700/70 transition-all focus:outline-none focus:ring-1 focus:ring-yellow-400/50"
        >
          {activeIcon}
          <h1 className="text-xs sm:text-sm font-semibold text-zinc-100 tracking-tight truncate">
            {title}
          </h1>
          {track && (
            <Badge
              variant="outline"
              className="text-[10px] sm:text-[11px] py-0.5 px-2 text-yellow-400 border-yellow-400/30 bg-yellow-400/10 font-medium tracking-wide flex-shrink-0"
            >
              {track.code}
            </Badge>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        className="w-72 max-h-80 overflow-y-auto bg-zinc-900 border-zinc-800 text-zinc-200 shadow-2xl p-1 z-50 rounded-xl"
      >
        {classTracks.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-emerald-400/90 px-2 py-1 flex items-center gap-1.5">
              <GraduationCap className="w-3 h-3" /> Classes
            </DropdownMenuLabel>
            {classTracks.map(renderItem)}
          </DropdownMenuGroup>
        )}

        {careerTracks.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-zinc-800/80 my-1" />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-blue-400/90 px-2 py-1 flex items-center gap-1.5">
                <Briefcase className="w-3 h-3" /> Career Pathways
              </DropdownMenuLabel>
              {careerTracks.map(renderItem)}
            </DropdownMenuGroup>
          </>
        )}

        {skillTracks.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-zinc-800/80 my-1" />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-amber-400/90 px-2 py-1 flex items-center gap-1.5">
                <Wrench className="w-3 h-3" /> Skills & Credentials
              </DropdownMenuLabel>
              {skillTracks.map(renderItem)}
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
