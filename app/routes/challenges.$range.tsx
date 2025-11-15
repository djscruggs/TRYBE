import {
  useParams,
  type LoaderFunctionArgs,
  useLoaderData,
} from "react-router";
import { useEffect, useState, useRef, JSX } from "react";
import type { ChallengeSummary, MemberChallenge } from "~/utils/types";
import ChallengeList from "~/components/challengeList";
import MyChallenges from "~/components/myChallenges";

export async function loader({ request, params }: LoaderFunctionArgs) {

  const range = params.range ?? "active";
  let url = `/api/challenges/${range}`;

  const response = await fetch(new URL(url, request.url));
  const data = await response.json();

  return {
    challenges: data.challenges as ChallengeSummary[],
    memberships: data.memberships || [],
  };
}

type LoaderData = {
  challenges: ChallengeSummary[];
  memberships: MemberChallenge[];
};

export default function ChallengesIndex(): JSX.Element {
  const { challenges: initialChallenges, memberships } =
    useLoaderData<LoaderData>();
  const browseRef = useRef<HTMLDivElement | null>(null);
  const [isExtended, setIsExtended] = useState(false); // this is used to extend the screen that the scroll into view is applied to
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [upcomingChallenges, setUpcomingChallenges] =
    useState<ChallengeSummary[]>(initialChallenges);
  const params = useParams();
  const status = params.range ?? "active";
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const [selfGuided, setSelfGuided] = useState(false);
  const handleCategoryChange = (newCategory: string): void => {
    setCategoryFilter((prev) =>
      prev.includes(newCategory)
        ? prev.filter((cat) => cat !== newCategory)
        : [...prev, newCategory]
    );
  };

  // Update challenges when loader data changes (route param changes)
  useEffect(() => {
    setUpcomingChallenges(initialChallenges);
    setFilteredChallenges(initialChallenges);
  }, [initialChallenges]);
  const [triggerRender, setTriggerRender] = useState(1);
  const scrollToBrowse = (): void => {
    setIsExtended(true);
    setTriggerRender((prev) => prev + 1);
  };
  useEffect(() => {
    if (isExtended && browseRef.current) {
      browseRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [triggerRender]);

  const [filteredChallenges, setFilteredChallenges] =
    useState<ChallengeSummary[]>(initialChallenges);

  // Client-side filtering when category or selfGuided changes
  useEffect(() => {
    let _filtered: ChallengeSummary[] = [];
    if (categoryFilter.length > 0 || selfGuided) {
      if (categoryFilter.length > 0) {
        upcomingChallenges.forEach((challenge) => {
          challenge.categories.forEach((category) => {
            if (categoryFilter.includes(category.name ?? "")) {
              _filtered.push(challenge);
            }
          });
        });
      } else {
        _filtered = upcomingChallenges.filter(
          (challenge) => challenge.type === "SELF_LED"
        );
      }
      if (selfGuided) {
        _filtered = _filtered.filter(
          (challenge) => challenge.type === "SELF_LED"
        );
      }
      setFilteredChallenges(_filtered);
    } else {
      setFilteredChallenges(upcomingChallenges);
    }
    setIsExtended(true);
  }, [categoryFilter, selfGuided]);
  const categories = ["Meditation", "Journal", "Creativity", "Health"];
  return (
    <div className="w-full pl-2">
      <MyChallenges range="active,upcoming" scrollToBrowse={scrollToBrowse} />
      <div ref={browseRef} className="text-red font-bold text-lg mb-2">
        Browse Challenges
      </div>
      <div className="space-x-4 flex items-center max-w-lg w-full justify-start text-xs md:text-sm">
        {categories.map((cat: string) => (
          <div
            key={cat}
            className={`w-fit p-1 px-2 rounded-md cursor-pointer ${categoryFilter.includes(cat) ? "bg-gray-400" : "text-black bg-gray-100"}`}
            onClick={() => {
              handleCategoryChange(cat);
            }}
          >
            {cat}
          </div>
        ))}
        <div className="flex items-center justify-start">
          <span className="text-grey mr-2">|</span>
          <div
            className={`w-fit p-1 px-2 rounded-md cursor-pointer ${selfGuided ? "bg-gray-400" : "text-black bg-gray-100"}`}
            onClick={() => {
              setSelfGuided((prev) => !prev);
            }}
          >
            Self-Guided
          </div>
        </div>
      </div>
      {filteredChallenges.length === 0 && (
        <p className="text-left text-gray-500 pt-2">
          No {selfGuided ? "self-guided" : "scheduled"} challenges in this
          category.
        </p>
      )}
      {filteredChallenges.length > 0 && (
        <div className="flex flex-col items-center max-w-lg w-full mt-4">
          <ChallengeList
            challenges={filteredChallenges}
            memberships={memberships}
            isLoading={false}
          />
        </div>
      )}
    </div>
  );
}
