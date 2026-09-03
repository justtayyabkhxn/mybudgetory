"use client";
import { useState } from "react";
import axios from "axios";

const eventTypes = ["Trip", "Dining", "Party", "Custom"];

export default function CreateEvent({ onEventCreated }: { onEventCreated?: () => void }) {
  const [step, setStep] = useState(1);
  const [eventData, setEventData] = useState({
    name: "",
    type: "Trip",
    date: "",
    description: "",
  });

  const [numParticipants, setNumParticipants] = useState(1);
  const [participants, setParticipants] = useState<string[]>([""]);

  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleEventChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleNumParticipantsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(1, Number(e.target.value));
    setNumParticipants(val);
    const updated = [...participants];
    while (updated.length < val) updated.push("");
    while (updated.length > val) updated.pop();
    setParticipants(updated);
  };

  const handleParticipantNameChange = (index: number, value: string) => {
    const updated = [...participants];
    updated[index] = value;
    setParticipants(updated);
  };

  const resetForm = () => {
    setStep(1);
    setEventData({ name: "", type: "Trip", date: "", description: "" });
    setNumParticipants(1);
    setParticipants([""]);
    setCreatedEventId(null);
  };

  const submitEvent = async () => {
    setError(null);
    if (!eventData.name.trim()) {
      setError("Event name is required.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("User not authenticated.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/create-event", eventData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setCreatedEventId(res.data.event._id);
      setStep(2);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError("Failed to create event. " + (err.response?.data?.error || err.message));
      } else if (err instanceof Error) {
        setError("Failed to create event. " + err.message);
      } else {
        setError("Failed to create event due to an unknown error.");
      }
    } finally {
      setLoading(false);
    }
  };

  const submitParticipants = async () => {
    setError(null);
    if (participants.some((p) => !p.trim())) {
      setError("Please fill in all participant names.");
      return;
    }

    if (!createdEventId) {
      setError("Event ID is missing. Please try again.");
      return;
    }
    // ✅ Call the callback prop here
    if (onEventCreated) {
      onEventCreated();
    }

    setLoading(true);
    try {
      await Promise.all(
        participants.map((name) =>
          axios.post("/api/participant", { name, eventId: createdEventId })
        )
      );
      setMessage("Event and participants created successfully!");
      resetForm();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError("Failed to add participants. " + (err.response?.data?.error || err.message));
      } else if (err instanceof Error) {
        setError("Failed to add participants. " + err.message);
      } else {
        setError("Failed to add participants due to an unknown error.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mt-10 mx-auto px-5 py-6 text-ink bg-canvas/80 shadow-xl rounded-2xl">
      <h1 className="text-xl font-bold mb-5">Create New Event</h1>

      {step === 1 && (
        <div className="space-y-5">
          <div className="flex gap-6">
            <input
              name="name"
              value={eventData.name}
              onChange={handleEventChange}
              type="text"
              className="w-full p-3 bg-ink rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Event Name"
            />

            <select
              name="type"
              value={eventData.type}
              onChange={handleEventChange}
              className="w-full p-3 bg-ink rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {eventTypes.map((et) => (
                <option key={et} value={et}>
                  {et}
                </option>
              ))}
            </select>
          </div>

          <input
            name="date"
            value={eventData.date}
            onChange={handleEventChange}
            type="date"
            className="w-full p-3 bg-ink rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <textarea
            name="description"
            value={eventData.description}
            onChange={handleEventChange}
            className="w-full p-3 bg-ink rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
            placeholder="Write a short description..."
          />

          {error && <p className="text-red-500 font-medium">{error}</p>}
          <p className="text-green-500 font-medium">{message}</p> 

          <button
            onClick={submitEvent}
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-active text-on-primary rounded-3xl font-semibold transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Next: Add Participants"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="block mb-2 font-semibold text-indigo-300">
              Number of Participants
            </label>
            <input
              type="number"
              min={1}
              value={numParticipants}
              onChange={handleNumParticipantsChange}
              className="w-24 p-3 bg-canvas-soft/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-4">
            {participants.map((name, idx) => (
              <div key={idx}>
                <label className="block mb-1 font-semibold text-indigo-300">
                  Participant {idx + 1}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleParticipantNameChange(idx, e.target.value)}
                  className="w-full p-3 bg-canvas-soft/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={`Name of Person ${idx + 1}`}
                />
              </div>
            ))}
          </div>

          {error && <p className="text-red-500 font-medium">{error}</p>}

          <button
            onClick={submitParticipants}
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-active text-on-primary rounded-3xl font-semibold transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Finish & Save Event"}
          </button>
        </div>
      )}
    </div>
  );
}
