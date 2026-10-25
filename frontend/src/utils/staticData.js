/* Static UI choices and public marketing content. User/workspace data is loaded from the backend. */

export const avatarLibrary = [
  { id: "av_01", name: "Business Woman", tag: "Corporate", img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=300&auto=format&fit=crop" },
  { id: "av_02", name: "Young Female", tag: "Lifestyle", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop" },
  { id: "av_03", name: "Young Male", tag: "Lifestyle", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop" },
  { id: "av_04", name: "Fitness Coach", tag: "Sport", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=300&auto=format&fit=crop" },
  { id: "av_05", name: "Beauty Influencer", tag: "Beauty", img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=300&auto=format&fit=crop" },
  { id: "av_06", name: "Tech Reviewer", tag: "Tech", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop" },
  { id: "av_07", name: "Travel Creator", tag: "Travel", img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=300&auto=format&fit=crop" },
  { id: "av_08", name: "Food Blogger", tag: "Food", img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=300&auto=format&fit=crop" },
];

export const voiceLibrary = [
  { id: "vo_01", name: "Maya", gender: "Female", tone: "Energetic" },
  { id: "vo_02", name: "Kabir", gender: "Male", tone: "Professional" },
  { id: "vo_03", name: "Ananya", gender: "Female", tone: "Soft" },
  { id: "vo_04", name: "Rohan", gender: "Male", tone: "Confident" },
  { id: "vo_05", name: "Isha", gender: "Female", tone: "Professional" },
  { id: "vo_06", name: "Dev", gender: "Male", tone: "Energetic" },
];

export const languageOptions = [
  "English", "Hindi", "Spanish", "French", "German", "Portuguese", "Arabic", "Japanese",
];

export const platformOptions = ["Instagram", "Facebook", "YouTube", "TikTok"];
export const adStyleOptions = ["UGC", "Review", "Testimonial", "Problem → Solution", "Lifestyle", "Storytelling"];
export const toneOptions = ["Professional", "Friendly", "Luxury", "Funny", "Emotional"];

export const faqItems = [
  { q: "Do I need any filming equipment?", a: "No. DRAG.ai generates the on-camera performance, voice and edit entirely from your product brief — no camera, actor or studio required." },
  { q: "How is the advertisement script created?", a: "DRAG.ai uses Gemini to prepare your advertisement script from the product brief, then HeyGen Video 1 generates the video with audio." },
  { q: "What platforms are the videos optimized for?", a: "Every export is framed and paced for Instagram Reels, TikTok, YouTube Shorts and Facebook feed placements." },
  { q: "Can I download the raw video file?", a: "Yes, finished videos can be downloaded in MP4 directly from the preview screen or from your project history." },
  { q: "What does PPT Generation include?", a: "The frontend collects presentation requirements, prepares a backend prompt and supports an optional slide outline. The backend will generate and return the final .pptx file." },
  { q: "Is there a limit on video length?", a: "The frontend supports video durations from 15 seconds up to 90 seconds; the backend can enforce any final generation limits." },
];
