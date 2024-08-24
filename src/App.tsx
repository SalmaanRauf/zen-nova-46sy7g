import { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";

interface ScheduleItem {
  time: string;
  endTime: string;
  title: string;
  color: string;
}

const ScheduleApp = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    {
      time: "06:15 AM",
      endTime: "09:00 AM",
      title: "Sleep",
      color: "bg-black", // Changed to black
    },
    {
      time: "06:30 AM",
      endTime: "07:30 AM",
      title: "Meditate",
      color: "bg-black", // Changed to black
    },
    {
      time: "12:00 PM",
      endTime: "01:00 PM",
      title: "Nap Window",
      color: "bg-black", // Changed to black
    },
    {
      time: "12:15 PM",
      endTime: "01:15 PM",
      title: "Reading",
      color: "bg-black", // Changed to black
    },
    {
      time: "12:30 PM",
      endTime: "01:30 PM",
      title: "Lunch",
      color: "bg-black", // Changed to black
    },
    {
      time: "08:00 PM",
      endTime: "09:00 PM",
      title: "Wind Down",
      color: "bg-black", // Changed to black
    },
    {
      time: "09:00 PM",
      endTime: "10:00 PM",
      title: "Sleep",
      color: "bg-black", // Changed to black
    },
  ]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth);
    }
  }, [containerRef.current]);

  const startTime = "05:15 AM";
  const endTime = "10:00 PM";

  const convertTo24Hour = (time: string) => {
    const [timePart, modifier] = time.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) {
      hours += 12;
    }
    if (modifier === "AM" && hours === 12) {
      hours = 0;
    }
    return { hours, minutes };
  };

  const startHour = convertTo24Hour(startTime).hours;
  const startMinute = convertTo24Hour(startTime).minutes;
  const endHour = convertTo24Hour(endTime).hours;

  const displayTimes = Array.from(
    { length: (endHour - startHour + 1) * 4 },
    (_, i) => {
      const minutes = startMinute + i * 15;
      const hour24 = startHour + Math.floor(minutes / 60);
      const minute = minutes % 60;
      const hour12 = hour24 % 12 || 12;
      const period = hour24 >= 12 ? "PM" : "AM";
      const timeString = `${String(hour12).padStart(2, "0")}:${String(
        minute
      ).padStart(2, "0")} ${period}`;

      // Show the label for 05:15 AM and every hour after that
      return {
        timeString,
        show: minute === 0 || (i === 0 && startMinute !== 0),
      };
    }
  );

  const getOverlappingEvents = (currentEvent: ScheduleItem) => {
    return schedule.filter(
      (event) =>
        convertTo24Hour(event.time).hours * 60 +
          convertTo24Hour(event.time).minutes <
          convertTo24Hour(currentEvent.endTime).hours * 60 +
            convertTo24Hour(currentEvent.endTime).minutes &&
        convertTo24Hour(event.endTime).hours * 60 +
          convertTo24Hour(event.endTime).minutes >
          convertTo24Hour(currentEvent.time).hours * 60 +
            convertTo24Hour(currentEvent.time).minutes
    );
  };

  const getEventPosition = (
    event: ScheduleItem,
    overlappingEvents: ScheduleItem[]
  ) => {
    const startMinutes =
      (convertTo24Hour(event.time).hours - startHour) * 60 +
      convertTo24Hour(event.time).minutes -
      startMinute;
    const endMinutes =
      (convertTo24Hour(event.endTime).hours - startHour) * 60 +
      convertTo24Hour(event.endTime).minutes -
      startMinute;
    const duration = endMinutes - startMinutes + 15; // Add 15 minutes to the duration

    const totalOverlaps = overlappingEvents.length + 1;

    // Calculate width and position based on the number of overlaps
    let width;
    if (totalOverlaps === 1) {
      width = containerWidth * 0.9; // 2x wider for one event
    } else if (totalOverlaps === 2) {
      width = (containerWidth * 0.9) / 2; // 2x wider for two events
    } else if (totalOverlaps === 3) {
      width = (containerWidth * 1.4) / 3; // 40% wider for three events
    } else {
      width = containerWidth / totalOverlaps; // Default case for 4 or more overlaps
    }

    const left = width * overlappingEvents.indexOf(event);

    return { startMinutes, duration, width, left };
  };

  return (
    <div
      className="mx-auto p-4 bg-green-500 min-h-screen" // Changed to green background
      ref={containerRef}
      style={{ width: "90vw" }} // Adjust the container width to fill more horizontal space
    >
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Schedule</h2>
        <Clock size={32} className="text-white" />
      </div>
      <div className="grid grid-cols-1 gap-1 relative">
        {displayTimes.map(({ timeString, show }, index) => (
          <div key={index} className="flex items-start py-2 h-8">
            <div className="w-16 text-right pr-2 text-white flex flex-col items-end">
              {show ? <span className="leading-none">{timeString}</span> : ""}
            </div>
            <div className="flex-1 relative">
              {schedule.map((event) => {
                const overlappingEvents = getOverlappingEvents(event);
                const { startMinutes, duration, width, left } =
                  getEventPosition(event, overlappingEvents);
                if (
                  startMinutes <= index * 15 &&
                  startMinutes + duration > index * 15
                ) {
                  return (
                    <div
                      key={`${event.title}-${event.time}`}
                      className={`absolute p-2 rounded text-sm ${event.color} flex items-center justify-center text-center overflow-hidden`}
                      style={{
                        top: `${(startMinutes - index * 15) * (8 / 15)}px`,
                        height: `${duration * (8 / 15)}px`,
                        width: `${width}px`,
                        left: `${left}px`,
                        color: "white", // White text color for event titles
                      }}
                    >
                      {event.title}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleApp;
