import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaPhone,
  FaStickyNote,
  FaRegCalendarAlt,
} from "react-icons/fa";
import { useAppContext } from '../../context/AppContext';
import DashboardLoader from '../../DashboardLoader';
import useWebSocket from '../../hooks/useWebSocket';
import WebSocketStatus from '../../components/WebSocketStatus';

function LaganCalendar() {
  const { axios } = useAppContext();
  const [pageLoading, setPageLoading] = useState(true);
  // Detect mobile view with better breakpoint
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
  // Get user role from localStorage
  const userRole = localStorage.getItem("role") || "Staff";
  const [hoveredDate, setHoveredDate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    notes: "",
  });
  const [bookings, setBookings] = useState({});
  const calendarRef = useRef(null);
  const [selectedRange, setSelectedRange] = useState({
    start: null,
    end: null,
  });
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setHoveredDate(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch bookings from backend and group by startDate
  useEffect(() => {
    fetchBookings();
  }, [month, year]);

  const handleBooking = () => {
    if (selectedDate) {
      setShowModal(true);
    } else {
      alert("Please select a date first.");
    }
  };

  const format = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const getAuspiciousDates = (year) => {
    const format = (m, d) =>
      `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return [
      format(1, 16),
      format(1, 17),
      format(1, 18),
      format(1, 19),
      format(1, 21),
      format(1, 22),
      format(1, 24),
      format(1, 25),
      format(1, 30),
      format(2, 3),
      format(2, 4),
      format(2, 6),
      format(2, 7),
      format(2, 13),
      format(2, 14),
      format(2, 15),
      format(2, 18),
      format(2, 19),
      format(2, 20),
      format(2, 21),
      format(2, 25),
      format(3, 1),
      format(3, 2),
      format(3, 3),
      format(3, 5),
      format(3, 6),
      format(4, 14),
      format(4, 16),
      format(4, 17),
      format(4, 18),
      format(4, 19),
      format(4, 20),
      format(4, 21),
      format(4, 22),
      format(4, 23),
      format(4, 25),
      format(4, 29),
      format(4, 30),
      format(5, 1),
      format(5, 5),
      format(5, 6),
      format(5, 7),
      format(5, 8),
      format(5, 10),
      format(5, 15),
      format(5, 17),
      format(5, 18),
      format(5, 19),
      format(5, 24),
      format(5, 28),
      format(6, 2),
      format(6, 4),
      format(6, 7),
      format(6, 8),
      format(7, 11),
      format(7, 12),
      format(7, 13),
      format(7, 17),
      format(7, 20),
      format(7, 21),
      format(7, 22),
      format(7, 26),
      format(7, 28),
      format(7, 29),
      format(7, 31),
      format(8, 1),
      format(8, 3),
      format(8, 4),
      format(8, 7),
      format(8, 8),
      format(8, 9),
      format(8, 13),
      format(8, 14),
      format(8, 17),
      format(8, 24),
      format(8, 25),
      format(8, 28),
      format(8, 29),
      format(8, 30),
      format(8, 31),
      format(9, 1),
      format(9, 2),
      format(9, 3),
      format(9, 4),
      format(9, 5),
      format(9, 26),
      format(9, 27),
      format(9, 28),
      format(10, 1),
      format(10, 2),
      format(10, 3),
      format(10, 4),
      format(10, 7),
      format(10, 8),
      format(10, 10),
      format(10, 11),
      format(10, 12),
      format(10, 22),
      format(10, 23),
      format(10, 24),
      format(10, 25),
      format(10, 26),
      format(10, 27),
      format(10, 28),
      format(10, 29),
      format(10, 30),
      format(10, 31),
      format(11, 2),
      format(11, 3),
      format(11, 4),
      format(11, 7),
      format(11, 8),
      format(11, 12),
      format(11, 13),
      format(11, 22),
      format(11, 23),
      format(11, 24),
      format(11, 25),
      format(11, 26),
      format(11, 27),
      format(11, 29),
      format(11, 30),
      format(12, 4),
      format(12, 5),
      format(12, 6),
    ];
  };

  const auspiciousDates = new Set(getAuspiciousDates(year));

  const getDateCategory = (date) => {
    const heavyDates = new Set(
      Array.from(auspiciousDates).filter((d) =>
        [1, 5, 10, 15, 20, 25, 30].includes(parseInt(d.split("-")[2]))
      )
    );
    const mediumDates = new Set(
      Array.from(auspiciousDates).filter((d) =>
        [2, 4, 7, 9, 17, 22, 27].includes(parseInt(d.split("-")[2]))
      )
    );
    if (heavyDates.has(date)) return "heavy";
    if (mediumDates.has(date)) return "medium";
    if (auspiciousDates.has(date)) return "light";
    return null;
  };

  const getTooltipText = (category) => {
    if (category === "heavy") return "Heavy Booking";
    if (category === "medium") return "Medium Booking";
    if (category === "light") return "Light Booking";
    return "";
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setBookings((prev) => {
      const dateBookings = prev[selectedDate] || [];
      return {
        ...prev,
        [selectedDate]: [...dateBookings, { ...formData }],
      };
    });
    setShowModal(false);
    setFormData({ name: "", contact: "", notes: "" });
  };

  const dateTemplate = ({ year, month, day }) => {
    const currentDate = format(year, month, day);
    const dayBookings = bookings[currentDate] || [];
    const bookingCount = dayBookings.length;
    
    // Determine fill position based on booking time
    let fillPosition = 'none'; // 'upper', 'lower', 'full', 'none'
    
    if (bookingCount === 1) {
      const booking = dayBookings[0];
      console.log('Booking data:', booking);
      const timeValue = booking.startTime || booking.timeSlot || booking.time || booking.slot;
      console.log('Available fields:', Object.keys(booking));
      if (timeValue) {
        const startHour = parseInt(timeValue.split(':')[0]);
        console.log('Time value:', timeValue, 'Start hour:', startHour);
        fillPosition = startHour < 16 ? 'upper' : 'lower';
        console.log('Fill position:', fillPosition);
      } else {
        console.log('No time found in any field, defaulting to upper');
        fillPosition = 'upper';
      }
    } else if (bookingCount >= 2) {
      fillPosition = 'full';
    }
    
    const isSelected = selectedDate === currentDate;
    const highlightClass = isSelected
      ? "border-4 shadow-lg scale-105 ring-2"
      : "border border-amber-200";
    
    return (
      <div
        className={`w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 relative rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 overflow-hidden touch-manipulation ${
          isSelected 
            ? 'bg-[#c3ad6b] text-white shadow-lg scale-105 border-2 border-[#c3ad6b]' 
            : 'bg-white hover:bg-[#c3ad6b]/10 border border-gray-200 hover:border-[#c3ad6b]/30 active:bg-[#c3ad6b]/20'
        }`}
        onClick={() => {
          setSelectedDate(currentDate);
        }}
        onMouseEnter={() => setHoveredDate(currentDate)}
        onMouseLeave={() => setHoveredDate(null)}
        title={bookingCount > 0 ? `${bookingCount} booking${bookingCount > 1 ? 's' : ''}` : ''}
      >
        {/* Fill based on booking time */}
        {fillPosition === 'upper' && !isSelected && (
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-[#c3ad6b]/40 rounded-t-lg" />
        )}
        {fillPosition === 'lower' && !isSelected && (
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#c3ad6b]/40 rounded-b-lg" />
        )}
        {fillPosition === 'full' && !isSelected && (
          <div className="absolute inset-0 bg-[#c3ad6b]/40 rounded-lg" />
        )}
        
        {/* Day number */}
        <span className={`font-bold text-xs xs:text-sm sm:text-base z-10 ${
          isSelected ? 'text-white' : 'text-gray-800'
        }`}>
          {day}
        </span>
        
        {/* Booking count indicator */}
        {bookingCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 xs:w-5 xs:h-5 flex items-center justify-center font-bold shadow text-[10px] xs:text-xs">
            {bookingCount > 9 ? '9+' : bookingCount}
          </div>
        )}
      </div>
    );
  };

  const renderCalendar = () => {
    const weeks = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    let day = 1;
    for (let week = 0; week < 6; week++) {
      const days = [];
      for (let i = 0; i < 7; i++) {
        const cellIndex = week * 7 + i;
        if (cellIndex < firstDay || day > daysInMonth) {
          days.push(
            <td key={i} className="h-12 xs:h-14 sm:h-16 md:h-20 align-top text-center"></td>
          );
        } else {
          const cellContent = dateTemplate({ year, month, day });
          days.push(
            <td key={i} className="h-12 xs:h-14 sm:h-16 md:h-20 p-0.5 xs:p-1">
              <div className="h-full flex items-center justify-center">
                {cellContent}
              </div>
            </td>
          );
          day++;
        }
      }
      const isRowEmpty = days.every(
        (cell) =>
          !cell.props.children || cell.props.children.props === undefined
      );
      if (!isRowEmpty) {
        weeks.push(<tr key={week}>{days}</tr>);
      }
    }
    return weeks;
  };

  const handlePrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Booking status filter state
  const [statusFilter, setStatusFilter] = useState("All");

  // Search bar state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null); // null = no search, [] = no results
  const [searchLoading, setSearchLoading] = useState(false);

  // WebSocket connection for real-time updates
  const { lastMessage } = useWebSocket();

  // Handle real-time booking updates
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'BOOKING_CREATED':
        case 'BOOKING_UPDATED':
        case 'BOOKING_DELETED':
          // Refresh bookings when any booking changes
          fetchBookings();
          break;
        default:
          break;
      }
    }
  }, [lastMessage]);

  // Extract fetchBookings function to be reusable
  const fetchBookings = async () => {
    try {
      const res = await axios.get(
        "/api/banquet-bookings/"
      );
      const grouped = {};
      res.data.forEach((b) => {
        // Use only the date part (before 'T') for grouping
        const dateKey = b.startDate.split("T")[0];
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(b);
      });
      setBookings(grouped);
      console.log("Fetched bookings:", res.data);
      console.log("Grouped bookings:", grouped);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    }
  };

  // Get bookings for the selected date
  const bookingsForDate = bookings[selectedDate] || [];
  // Filter bookings by status if filter is not 'All'
  const filteredBookingsForDate =
    statusFilter === "All"
      ? bookingsForDate
      : bookingsForDate.filter(
          (b) =>
            (b.bookingStatus || "").toLowerCase() === statusFilter.toLowerCase()
        );

  // Final list to display: search results if searching, else filteredBookingsForDate
  const displayBookings =
    searchTerm.trim() && searchResults !== null
      ? searchResults
      : filteredBookingsForDate;

  if (pageLoading) {
    return <DashboardLoader pageName="Event Calendar" />;
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'hsl(45, 100%, 95%)'}}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 xs:px-4 py-3 xs:py-4 flex items-center justify-between">
          <h1 className="text-lg xs:text-xl sm:text-2xl font-bold truncate" style={{color: 'hsl(45, 100%, 20%)'}}>
            Lagan Calendar
          </h1>
          <div className="flex items-center gap-2 xs:gap-4">
            <span className="inline-flex items-center gap-1 xs:gap-2 px-2 xs:px-3 py-1 rounded-full bg-[#c3ad6b]/10 text-[#c3ad6b] font-semibold text-xs xs:text-sm shadow">
              {userRole === "Admin" ? "👑 Admin" : "👤 Staff"}
            </span>
            {!isMobile && <WebSocketStatus />}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 xs:px-4 py-4 xs:py-6">
        <div className="bg-white rounded-lg xs:rounded-xl shadow-md overflow-hidden">
          <div className="p-3 xs:p-4 sm:p-6">
            {/* Navigation */}
            <div className="flex flex-col xs:flex-row justify-between items-center gap-3 xs:gap-4 mb-4 xs:mb-6">
              <button
                onClick={handlePrev}
                className="px-4 xs:px-6 py-2 xs:py-3 bg-[#c3ad6b] hover:bg-[#b39b5a] active:bg-[#a08a4f] text-white rounded-lg shadow font-semibold transition-colors touch-manipulation text-sm xs:text-base"
              >
                ← Previous
              </button>
              <h2 className="text-lg xs:text-xl md:text-2xl font-bold text-center px-2" style={{color: 'hsl(45, 100%, 20%)'}}>
                {`${monthNames[month]} ${year}`}
              </h2>
              <button
                onClick={handleNext}
                className="px-4 xs:px-6 py-2 xs:py-3 bg-[#c3ad6b] hover:bg-[#b39b5a] active:bg-[#a08a4f] text-white rounded-lg shadow font-semibold transition-colors touch-manipulation text-sm xs:text-base"
              >
                Next →
              </button>
            </div>

            {/* Calendar */}
            <div className="overflow-x-auto bg-[#c3ad6b]/10 rounded-lg xs:rounded-xl p-2 xs:p-4">
              <table className="w-full border-collapse min-w-[280px] xs:min-w-[320px] sm:min-w-[480px] md:min-w-[600px]">
                <thead>
                  <tr>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                      <th
                        key={day}
                        className="h-8 xs:h-10 sm:h-12 text-xs xs:text-sm md:text-base font-bold text-[#c3ad6b] border-b-2 border-[#c3ad6b]/20 px-1"
                      >
                        {isMobile && window.innerWidth < 400 ? day.charAt(0) : day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>{renderCalendar()}</tbody>
              </table>
            </div>

            {/* Add Booking Button */}
            <div className="mt-4 xs:mt-6 text-center">
              <Link
                to="/add-booking"
                state={{ selectedDate }}
              >
                <button
                  className={`py-2 xs:py-3 px-6 xs:px-8 rounded-lg font-semibold shadow transition-colors touch-manipulation text-sm xs:text-base ${
                    selectedDate
                      ? "bg-[#c3ad6b] hover:bg-[#b39b5a] active:bg-[#a08a4f] text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!selectedDate}
                  onClick={handleBooking}
                >
                  {isMobile && selectedDate ? `Book ${selectedDate}` : `Book Now ${selectedDate ? `for ${selectedDate}` : ''}`}
                </button>
              </Link>
            </div>
          </div>
        </div>
        {/* Booking list for selected date */}
        {selectedDate && (
          <div className="mt-4 xs:mt-6">
            <div className="bg-white rounded-lg xs:rounded-xl shadow-md overflow-hidden">
              <div className="p-3 xs:p-4 sm:p-6">
                <h3 className="text-lg xs:text-xl font-bold mb-3 xs:mb-4" style={{color: 'hsl(45, 100%, 20%)'}}>
                  Bookings for {selectedDate}
                </h3>
                
                {/* Status Filter & Search */}
                <div className="mb-4 xs:mb-6 flex flex-col gap-3 xs:gap-4">
                  <div className="flex flex-col xs:flex-row gap-3 xs:gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-[#c3ad6b] whitespace-nowrap">Status:</label>
                      <select
                        className="border border-[#c3ad6b]/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#c3ad6b] focus:border-[#c3ad6b] flex-1 xs:flex-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="All">All</option>
                        <option value="Tentative">Tentative</option>
                        <option value="Enquiry">Enquiry</option>
                        <option value="Confirmed">Confirmed</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        className="border border-[#c3ad6b]/30 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-[#c3ad6b] focus:border-[#c3ad6b]"
                        placeholder={isMobile ? "Search..." : "Search by name or phone..."}
                        value={searchTerm}
                        onChange={async (e) => {
                          const val = e.target.value;
                          setSearchTerm(val);
                          if (!val.trim()) {
                            setSearchResults(null);
                            return;
                          }
                          setSearchLoading(true);
                          try {
                            const resp = await axios.get(
                              `/api/bookings/search?q=${encodeURIComponent(val)}`
                            );
                            const results = (resp.data.data || resp.data || []).filter(
                              (b) => {
                                const dateKey = b.startDate && b.startDate.split("T")[0];
                                return dateKey === selectedDate;
                              }
                            );
                            setSearchResults(results);
                          } catch (err) {
                            setSearchResults([]);
                          } finally {
                            setSearchLoading(false);
                          }
                        }}
                      />
                      {searchLoading && (
                        <span className="text-xs text-[#c3ad6b] whitespace-nowrap">Searching...</span>
                      )}
                    </div>
                  </div>
                </div>

                {displayBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-lg">
                      {searchTerm.trim()
                        ? "No bookings found for this search"
                        : `No bookings for this date${
                            statusFilter !== "All" ? ` with status "${statusFilter}"` : ""
                          }`}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 xs:gap-4">
                    {displayBookings.map((b, i) => (
                      <div
                        key={i}
                        className="bg-[#c3ad6b]/10 border border-[#c3ad6b]/20 rounded-lg p-3 xs:p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="font-bold text-gray-800 mb-2 text-sm xs:text-base">{b.name}</div>
                        <div className="text-xs xs:text-sm text-gray-600 space-y-1 mb-3">
                          <div className="break-all">📞 {b.number || b.contact}</div>
                          <div>📋 {b.bookingStatus}</div>
                          {b.notes && (
                            <div className="break-words">📝 {b.notes}</div>
                          )}
                        </div>
                        <div className="flex flex-col xs:flex-row gap-2">
                          <button
                            onClick={() => {
                              if (b._id) navigate(`/banquet/update-booking/${b._id}`);
                            }}
                            className="flex-1 bg-[#c3ad6b] hover:bg-[#b39b5a] active:bg-[#a08a4f] text-white px-3 py-2 rounded-lg text-xs xs:text-sm font-medium transition-colors touch-manipulation"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (b._id) navigate(`/banquet/invoice/${b._id}`);
                            }}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white px-3 py-2 rounded-lg text-xs xs:text-sm font-medium transition-colors touch-manipulation"
                          >
                            Invoice
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default LaganCalendar;
