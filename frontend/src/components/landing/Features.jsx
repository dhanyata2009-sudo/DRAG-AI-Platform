import { motion } from "framer-motion";
import { ArrowRight, Check, Presentation, Video } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../common/Card";
import { ROUTES } from "../../utils/constants";

const features = [
  {
    icon: Video,
    title: "Video Generation",
    desc: "Prepare a product brief, script, avatar and voice selection for the video-generation backend.",
    items: ["AI script request or your own script", "Avatar and voice selection", "Language, format and duration controls"],
  },
  {
    icon: Presentation,
    title: "PPT Generation",
    desc: "Turn a topic, audience and key points into a structured presentation-generation request.",
    items: ["Presentation brief and slide count", "Dynamic backend prompt", "Optional slide-by-slide outline"],
  },
];

const Features = () => (
  <section id="features" className="relative overflow-hidden border-y border-app bg-panel/45 py-24">
    <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-[#b99a79]/10 blur-3xl" />
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
      <div className="max-w-2xl mb-14">
        <span className="text-xs font-mono text-violet-500 tracking-wider">TWO CORE FEATURES</span>
        <h2 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-body mt-3">
          One System, two creation workflows.
        </h2>
        <p className="text-subtle mt-4 leading-relaxed">
          Choose the workflow you need. Each one turns a rough idea into an organized, backend-ready generation request.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
          >
            <Card accent hover className={`h-full overflow-hidden p-7 sm:p-8 ${index === 1 ? "bg-[#eef0e9]" : "bg-[#fffaf3]"}`}>
              <div className="h-12 w-12 rounded-xl bg-gradient-brand flex items-center justify-center text-white mb-6">
                <feature.icon size={22} />
              </div>
              <h3 className="font-display text-2xl font-semibold text-body">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-subtle">{feature.desc}</p>
              <ul className="mt-6 space-y-3">
                {feature.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-subtle">
                    <Check size={16} className="mt-0.5 shrink-0 text-cyan-400" /> {item}
                  </li>
                ))}
              </ul>
              <Link to={ROUTES.LOGIN} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700">
                Try {feature.title} <ArrowRight size={15} />
              </Link>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 grid gap-4 rounded-3xl border border-app bg-panel p-5 sm:grid-cols-3 sm:p-7">
        {[
          ["01", "Add your idea", "Enter the topic, audience and creative direction."],
          ["02", "Shape the content", "Review scripts, outlines and generation options."],
          ["03", "Prepare generation", "Send a clean request to the future backend service."],
        ].map(([step, title, text]) => (
          <div key={step} className="rounded-2xl bg-panel-2 p-5">
            <span className="font-mono text-xs font-semibold text-violet-500">{step}</span>
            <h3 className="mt-3 font-display text-lg font-semibold text-body">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-subtle">{text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
