/* eslint-disable react/prop-types */
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import DirectionsBusFilledRoundedIcon from "@mui/icons-material/DirectionsBusFilledRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import HealthAndSafetyRoundedIcon from "@mui/icons-material/HealthAndSafetyRounded";
import VolunteerActivismRoundedIcon from "@mui/icons-material/VolunteerActivismRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import MovieRoundedIcon from "@mui/icons-material/MovieRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import { categoryDetails } from "./utils";

const ICONS = {
  food: RestaurantRoundedIcon,
  transport: DirectionsBusFilledRoundedIcon,
  bills: BoltRoundedIcon,
  shopping: ShoppingBagRoundedIcon,
  health: HealthAndSafetyRoundedIcon,
  giving: VolunteerActivismRoundedIcon,
  education: SchoolRoundedIcon,
  home: HomeRoundedIcon,
  entertainment: MovieRoundedIcon,
  other: MoreHorizRoundedIcon,
};

export default function CategoryIcon({ category, size = 20 }) {
  const details = categoryDetails(category);
  const Icon = ICONS[details.icon] || MoreHorizRoundedIcon;
  return <Icon sx={{ fontSize: size }} aria-hidden="true" />;
}
