export interface Project {
  id: number;
  title: string;
  category: "Logos" | "Infographics" | "Posters" | "Branding" | "Art";
  image: string;
  additionalImages?: string[];
  description: string;
  tools: string[];
}

export const projects: Project[] = [
  {
    id: 1,
    title: "Drift Coffee",
    category: "Logos",
    image: "/assets/logos/drift.jpg",
    description: "A clean geometric logo design for a coffee brand.",
    tools: ["Illustrator"],
  },
  {
    id: 2,
    title: "Data Visualization Infographic",
    category: "Infographics",
    image: "/assets/infographics/info1.jpg",
    description: "An engaging infographic showcasing business data trends.",
    tools: ["Photoshop", "Canva"],
  },
  {
    id: 3,
    title: "Music Festival Poster",
    category: "Posters",
    image: "/assets/posters/Newww.jpg",
    description: "Vibrant event poster designed for a live concert event.",
    tools: ["Photoshop"],
  },
  {
    id: 5,
    title: "The Noir Club",
    category: "Logos",
    image: "/assets/logos/The Noir Club.png",
    description: "A sophisticated and timeless logo crafted for an exclusive luxury club.",
    tools: ["Photoshop", "Figma"],
  },
  {
    id: 6,
    title: "Three Blind Mice",
    category: "Logos",
    image: "/assets/logos/Blind.png",
    description: "A sleek, modern emblem balancing clarity and negative space for a visionary brand.",
    tools: ["Photoshop"],
  },
  {
    id: 7,
    title: "Elvora Fintech",
    category: "Logos",
    image: "/assets/logos/elvora.jpg",
    description: "A dynamic wordmark and emblem designed for a modern fintech app.",
    tools: ["Illustrator"],
  },
  {
    id: 8,
    title: "Peachees Lipgloss",
    category: "Logos",
    image: "/assets/logos/peachees.png",
    description: "A playful and vibrant logo illustration aimed at capturing youthful energy. For a lipgloss brand",
    tools: ["Illustrator"],
  },
  {
    id: 9,
    title: "Art Style",
    category: "Art",
    image: "/assets/art/art1.jpg",
    description: "Complete visual identity system for a wellness brand.",
    tools: ["Illustrator"],
  },
  {
    id: 10,
    title: "Art Style",
    category: "Art",
    image: "/assets/art/art3.jpg",
    description: "Complete visual identity system for a wellness brand.",
    tools: ["Illustrator"],
  },
  {
    id: 11,
    title: "Art Style",
    category: "Art",
    image: "/assets/art/art4.jpg",
    description: "Complete visual identity system for a wellness brand.",
    tools: ["Illustrator"],
  },
  {
    id: 12,
    title: "Art",
    category: "Art",
    image: "/assets/art/art5.jpg",
    description: "Complete visual identity system for a wellness brand.",
    tools: ["Illustrator"],
  },
  {
    id: 13,
    title: "Art Style",
    category: "Art",
    image: "/assets/art/art6.jpg",
    description: "Complete visual identity system for a wellness brand.",
    tools: ["Illustrator"],
  },
  {
    id: 14,
    title: "Art on Product",
    category: "Art",
    image: "/assets/art/art7.jpg",
    description: "Complete visual identity system for a wellness brand.",
    tools: ["Illustrator"],
  },
  {
    id: 15,
    title: "Art on Product",
    category: "Art",
    image: "/assets/art/art8.jpg",
    description: "Complete visual identity system for a wellness brand.",
    tools: ["Illustrator"],
  },
  {
    id: 19,
    title: "Data Visualization Infographic",
    category: "Infographics",
    image: "/assets/infographics/Hakuna2.jpg",
    description: "An engaging infographic showcasing business data trends.",
    tools: ["Photoshop", "Canva"],
  },
  {
    id: 20,
    title: "Data Visualization Infographic",
    category: "Infographics",
    image: "/assets/infographics/HackerHouse.png",
    description: "An engaging infographic showcasing business data trends.",
    tools: ["Photoshop", "Canva"],
  },
  {
    id: 21,
    title: "Coffee Shop Poster",
    category: "Posters",
    image: "/assets/posters/drift.jpg",
    description: "Coffee Shop Brand Poster",
    tools: ["Photoshop"],
  },
  {
    id: 22,
    title: "Music Festival Poster",
    category: "Infographics",
    image: "/assets/posters/relent.jpg",
    description: "Vibrant event poster designed for a live concert event.",
    tools: ["Photoshop"],
  },
  {
    id: 23,
    title: "New Month Poster September",
    category: "Infographics",
    image: "/assets/posters/september.jpg",
    description: "Vibrant event poster designed for a live concert event.",
    tools: ["Photoshop"],
  },
  {
    id: 24,
    title: "Poster Design 1",
    category: "Posters",
    image: "/assets/posters/Poster (1).jpg",
    description: "Creative and vibrant poster design.",
    tools: ["Photoshop"],
  },
  {
    id: 25,
    title: "Poster Design 2",
    category: "Posters",
    image: "/assets/posters/Poster (2).jpg",
    description: "Creative and vibrant poster design.",
    tools: ["Photoshop"],
  },
  {
    id: 26,
    title: "Poster Design 3",
    category: "Posters",
    image: "/assets/posters/Poster (3).jpg",
    description: "Creative and vibrant poster design.",
    tools: ["Photoshop"],
  },
  {
    id: 27,
    title: "Poster Design 4",
    category: "Posters",
    image: "/assets/posters/Poster (4).jpg",
    description: "Creative and vibrant poster design.",
    tools: ["Photoshop"],
  },
  {
    id: 28,
    title: "Poster Design 5",
    category: "Posters",
    image: "/assets/posters/Poster (5).jpg",
    description: "Creative and vibrant poster design.",
    tools: ["Photoshop"],
  },
  {
    id: 29,
    title: "Poster Design 6",
    category: "Posters",
    image: "/assets/posters/Poster (6).jpg",
    description: "Creative and vibrant poster design.",
    tools: ["Photoshop"],
  },
  {
    id: 30,
    title: "Poster Design 7",
    category: "Posters",
    image: "/assets/posters/Poster (7).jpg",
    description: "Creative and vibrant poster design.",
    tools: ["Photoshop"],
  },
  {
    id: 31,
    title: "Poster Design 8",
    category: "Posters",
    image: "/assets/posters/Poster (8).jpg",
    description: "Creative and vibrant poster design.",
    tools: ["Photoshop"],
  },
  {
    id: 32,
    title: "Poster Design 10",
    category: "Posters",
    image: "/assets/posters/Poster (10).jpg",
    description: "Creative and vibrant poster design.",
    tools: ["Photoshop"],
  },
  {
    id: 33,
    title: "Poster Design 11",
    category: "Posters",
    image: "/assets/posters/Poster_(11).jpg",
    description: "Creative and vibrant poster design.",
    tools: ["Photoshop"],
  },
  {
    id: 34,
    title: "Sendora Delivery Branding",
    category: "Branding",
    image: "/assets/branding/Sendora/Sendora visual identity.jpg",
    additionalImages: [
      "/assets/branding/Sendora/sendora delivery rider.jpg",
      "/assets/branding/Sendora/sendora delivery truck 2.jpg",
      "/assets/branding/Sendora/sendora logo on wall.jpg"
    ],
    description: "Sendora is a bold and dynamic delivery service brand designed to convey speed, trust, and reliability across modern logistics.",
    tools: ["Illustrator", "Photoshop"]
  },
  {
    id: 35,
    title: "Evolra Fintech App",
    category: "Branding",
    image: "/assets/branding/Evolra/Evolra app.jpg",
    additionalImages: [
      "/assets/branding/Evolra/Evolra Tshirts.jpg",
      "/assets/branding/Evolra/Evolra Wristbands.jpg",
      "/assets/branding/Evolra/Evolra white.jpg",
      "/assets/branding/Evolra/Evolra.jpg"
    ],
    description: "Evolra is a cutting-edge fintech brand and mobile application focused on seamless payments, delivering a secure and highly intuitive user experience.",
    tools: ["Figma", "Illustrator"]
  },
  {
    id: 36,
    title: "Groove District Movement",
    category: "Branding",
    image: "/assets/branding/Groove District/Groove district mockup.jpg",
    additionalImages: [
      "/assets/branding/Groove District/1385923_OYHIV41 copy.jpg",
      "/assets/branding/Groove District/Billboard_Mockup.jpg",
      "/assets/branding/Groove District/Free_Skateboard_Mockup_2.jpg",
      "/assets/branding/Groove District/Skateboard_Mockup_1.jpg",
      "/assets/branding/Groove District/Wristband_Mockup.jpg",
      "/assets/branding/Groove District/groove district copy.jpg"
    ],
    description: "Groove District is an inclusive, expressive skater brand and social movement, uniting communities through vibrant merchandise, events, and culture.",
    tools: ["Photoshop", "Illustrator"]
  },
  {
    id: 37,
    title: "G-Dials Horology",
    category: "Branding",
    image: "/assets/branding/G-Dials/Wristwatch mockup.jpg",
    additionalImages: [
      "/assets/branding/G-Dials/Shopping Bag Mockup.jpg",
      "/assets/branding/G-Dials/Sticker Mockup.jpg",
      "/assets/branding/G-Dials/T shirt mock up.jpg"
    ],
    description: "G-Dials represents elegance, precision, and timeless design in the world of high-quality wristwatches.",
    tools: ["Photoshop", "Illustrator"]
  },
  {
    id: 38,
    title: "Drift Minimalist Coffee",
    category: "Branding",
    image: "/assets/branding/Drift/Hand-Holding-Coffee-Cup-Mockup copy.jpg",
    additionalImages: [
      "/assets/branding/Drift/6.jpg",
      "/assets/branding/Drift/Chef Kitchen Apron Mockup copy.jpg",
      "/assets/branding/Drift/Free Take Away Paper Cup Mockup copy.jpg",
      "/assets/branding/Drift/Free_Sign_Mockup_1 copy.jpg",
      "/assets/branding/Drift/Portable Pop Up Gazebo Mockup.jpg",
      "/assets/branding/Drift/The_Mixed_Coffee_Cups_Mockup_2 copy.jpg",
      "/assets/branding/Drift/behance-653db795c70b5 copy.jpg"
    ],
    description: "Drift is a modern, minimalist coffee brand crafted for connoisseurs. The visual identity reflects simplicity, warmth, and the purity of a perfect brew.",
    tools: ["Photoshop", "Figma", "Illustrator"]
  },
  {
    id: 39,
    title: "Soft Slice Studio",
    category: "Branding",
    image: "/assets/branding/Soft Slice Studio/SM TEMPLATE 1.jpg",
    additionalImages: [
      "/assets/branding/Soft Slice Studio/Banana  Bread Mockup.jpg",
      "/assets/branding/Soft Slice Studio/Chef Kitchen Apron Mockup copy.png",
      "/assets/branding/Soft Slice Studio/Plastic Bag Mockup.jpg",
      "/assets/branding/Soft Slice Studio/soft slice studio label 1.png",
      "/assets/branding/Soft Slice Studio/sticker mockup.jpg"
    ],
    description: "Soft Slice Studio is an artisanal bakery brand serving up warmth and delight. The identity emphasizes approachability, rich flavors, and handcrafted quality.",
    tools: ["Photoshop", "Illustrator"]
  }
];
