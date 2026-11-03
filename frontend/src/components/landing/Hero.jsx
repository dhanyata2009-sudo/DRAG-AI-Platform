import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Layers3,
  Play,
  Presentation,
  Sparkles,
  Video,
} from "lucide-react";
import Button from "../common/Button";
import { ROUTES } from "../../utils/constants";

const highlights = ["No pricing or trials", "Video + PPT workflows"];

const Hero = () => (
  <section id="home" className="relative isolate overflow-hidden pb-24 pt-14 sm:pt-20 lg:pb-28 lg:pt-24">
    <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_18%,rgba(154,106,67,0.20),transparent_32%),radial-gradient(circle_at_18%_68%,rgba(104,112,91,0.14),transparent_30%)]" />
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-violet-400/45 to-transparent" />

    <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-10">
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-app bg-panel/90 px-4 py-2 text-xs font-medium text-subtle shadow-sm"
        >
          <Sparkles size={14} className="text-violet-500" />
          A free AI creation workspace for students
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.06 }}
          className="max-w-3xl font-display text-5xl font-semibold leading-[1.03] tracking-[-0.045em] text-body sm:text-6xl xl:text-[72px]"
        >
          Create your next
          <span className="block text-gradient">video or presentation</span>
          in one place.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.13 }}
          className="mt-6 max-w-xl text-base leading-7 text-subtle sm:text-lg"
        >
          Go from a simple idea to a complete video brief or presentation plan
          through focused, easy-to-follow creative workflows.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <Button as={Link} to={ROUTES.LOGIN} size="lg" icon={ArrowRight} iconPosition="right">
            Get Started With DRAG.ai
          </Button>
          <Button as="a" href="#features" variant="secondary" size="lg" icon={Play}>
            Explore features
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-wrap gap-x-5 gap-y-2"
        >
          {highlights.map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5 text-xs font-medium text-subtle">
              <CheckCircle2 size={14} className="text-cyan-500" /> {item}
            </span>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 24, scale: 0.98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.12 }}
        className="relative mx-auto w-full max-w-[580px]"
      >
        <div className="absolute -inset-8 -z-10 rounded-full bg-gradient-to-br from-[#c8a27b]/30 via-[#eee0cf]/20 to-[#9aa08b]/25 blur-3xl" />
        <div className="overflow-hidden rounded-[28px] border border-white/70 bg-[#fffdf8]/90 p-3 shadow-[0_30px_90px_-35px_rgba(73,53,36,0.45)] backdrop-blur-xl">
          <div className="rounded-[22px] border border-[#e7dac8] bg-[#f8f1e7] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#c98268]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#d4b56f]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#7e9a82]" />
              </div>
              <span className="rounded-full bg-white/80 px-3 py-1 font-mono text-[10px] text-[#7b6d5f]">DRAG.ai studio</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-[0.72fr_1.28fr]">
              <div className="space-y-3">
                <div className="rounded-2xl border border-[#eadfce] bg-white/75 p-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand text-white">
                    <Video size={18} />
                  </span>
                  <p className="mt-4 font-display text-sm font-semibold text-[#2c261f]">Video Generation</p>
                  <p className="mt-1 text-[11px] leading-5 text-[#776b60]">Brief · Script · Avatar · Voice</p>
                </div>
                <div className="rounded-2xl border border-[#dfe1d7] bg-[#eef0e9] p-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#68705b] text-white">
                    <Presentation size={18} />
                  </span>
                  <p className="mt-4 font-display text-sm font-semibold text-[#2c261f]">PPT Generation</p>
                  <p className="mt-1 text-[11px] leading-5 text-[#776b60]">Topic · Outline · Style · Slides</p>
                </div>
              </div>

              <div className="relative min-h-[330px] overflow-hidden rounded-2xl bg-[#25221f] p-5 text-white sm:min-h-[365px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_25%,rgba(192,145,101,0.45),transparent_32%),radial-gradient(circle_at_15%_88%,rgba(126,139,111,0.35),transparent_36%)]" />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-medium text-white/75">CREATIVE WORKSPACE</span>
                    <Layers3 size={16} className="text-white/55" />
                  </div>
                  <div className="my-auto py-10 text-center">
                    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#725038] shadow-2xl shadow-black/30">
                      <Play size={25} fill="currentColor" />
                    </span>
                    <p className="mt-5 font-display text-xl font-semibold">Idea to output</p>
                    <p className="mx-auto mt-2 max-w-[210px] text-xs leading-5 text-white/60">A guided frontend for shaping content before generation.</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15"><Sparkles size={13} /></span>
                      <div className="flex-1">
                        <div className="h-1.5 w-4/5 rounded-full bg-white/35" />
                        <div className="mt-1.5 h-1.5 w-1/2 rounded-full bg-white/15" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-5 -left-2 rounded-2xl border border-app bg-panel px-4 py-3 shadow-xl sm:-left-7"
        >
          <p className="text-[10px] font-mono text-faint">WORKFLOWS READY</p>
          <p className="mt-1 text-sm font-semibold text-body">Video + PPT</p>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

export default Hero;
