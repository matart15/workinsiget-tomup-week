import { MaterialIcons } from '@expo/vector-icons';
// adjust icon lib
const category_icons = {
  travel: <MaterialIcons name="flight" size={24} color="white" />,
  transportation: <MaterialIcons name="directions-car" size={24} color="white" />,
  experience: <MaterialIcons name="explore" size={24} color="white" />,
  event: <MaterialIcons name="event" size={24} color="white" />,
  ticket: <MaterialIcons name="confirmation-number" size={24} color="white" />,
  gift: <MaterialIcons name="card-giftcard" size={24} color="white" />,
  group: <MaterialIcons name="group" size={24} color="white" />,
  other: <MaterialIcons name="more-horiz" size={24} color="white" />,
};

export type ConciergeIconName = keyof typeof category_icons;

export const ConciergeIcon = ({
  name,
}: {
  name: keyof typeof category_icons;
}) => {
  return category_icons[name];
};
