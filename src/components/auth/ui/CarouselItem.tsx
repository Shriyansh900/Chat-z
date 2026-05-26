'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import React, { JSX } from 'react';
import { Shield, Zap, Users, Lock, MessageCircle } from 'lucide-react';

export interface CarouselItem {
  title: string;
  description: string;
  id: number;
  icon: React.ReactNode;
  color: string;
}

export interface CarouselProps {
  items?: CarouselItem[];
  baseWidth?: number;
  cardHeight?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  round?: boolean;
}

const DEFAULT_ITEMS: CarouselItem[] = [
  {
    title: 'End-to-End Encrypted',
    description:
      'Every message is encrypted on your device. Only you and your recipient hold the keys.',
    id: 1,
    icon: <Shield className="w-5 h-5 text-white" />,
    color: 'from-[#5df8d8] to-[#6fd1d7]',
  },
  {
    title: 'Real-Time Messaging',
    description: 'Powered by Socket.IO for sub-50ms delivery. Instant, always.',
    id: 2,
    icon: <Zap className="w-5 h-5 text-white" />,
    color: 'from-[#6fd1d7] to-[#3b7597]',
  },
  {
    title: 'Group Channels',
    description:
      'Create encrypted group chats for teams, friends, and communities.',
    id: 3,
    icon: <Users className="w-5 h-5 text-white" />,
    color: 'from-[#3b7597] to-[#093c5d]',
  },
  {
    title: 'Zero Knowledge',
    description:
      'We never store readable messages. Your privacy is guaranteed by design.',
    id: 4,
    icon: <Lock className="w-5 h-5 text-white" />,
    color: 'from-[#5df8d8] to-[#3b7597]',
  },
  {
    title: 'Rich Messaging',
    description:
      'Reactions, read receipts, typing indicators — everything you expect.',
    id: 5,
    icon: <MessageCircle className="w-5 h-5 text-white" />,
    color: 'from-[#6fd1d7] to-[#5df8d8]',
  },
];

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: 'spring' as const, stiffness: 300, damping: 30 };

interface CarouselItemProps {
  item: CarouselItem;
  index: number;
  itemWidth: number;
  cardHeight: number;
  round: boolean;
  trackItemOffset: number;
  x: ReturnType<typeof useMotionValue<number>>;
  transition: object;
}

function CarouselItemCard({
  item,
  index,
  itemWidth,
  cardHeight,
  round,
  trackItemOffset,
  x,
  transition,
}: CarouselItemProps) {
  const range = [
    -(index + 1) * trackItemOffset,
    -index * trackItemOffset,
    -(index - 1) * trackItemOffset,
  ];
  const outputRange = [90, 0, -90];
  const rotateY = useTransform(x, range, outputRange, { clamp: false });

  return (
    <motion.div
      key={`${item?.id ?? index}-${index}`}
      className={`relative shrink-0 flex flex-col overflow-hidden cursor-grab active:cursor-grabbing ${
        round
          ? 'items-center justify-center text-center'
          : 'items-start justify-between'
      }`}
      style={{
        width: itemWidth,
        height: round ? itemWidth : cardHeight,
        rotateY,
        borderRadius: round ? '50%' : '16px',
        background: 'rgba(9, 60, 93, 0.3)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(111, 209, 215, 0.15)',
      }}
      transition={transition}
    >
      {/* Gradient accent top bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${item.color}`}
      />

      {/* Ambient glow */}
      <div
        className={`absolute top-4 right-4 w-16 h-16 bg-gradient-to-br ${item.color} opacity-10 rounded-full blur-xl pointer-events-none`}
      />

      <div className="p-5 w-full">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-6 h-6 rounded-md bg-[#060d14] border border-[#6fd1d7]/30 flex items-center justify-center">
            <Zap size={12} className="text-[#5df8d8]" />
          </div>
          <span className="text-white font-bold text-sm tracking-tight">
            Nex
            <span
              style={{
                background: 'linear-gradient(135deg, #5df8d8, #6fd1d7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Chat
            </span>
          </span>
        </div>

        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg`}
        >
          {item.icon}
        </div>

        <h3 className="text-white font-bold text-base mb-2 leading-tight">
          {item.title}
        </h3>
        <p className="text-slate-400 text-xs leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Bottom accent */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r ${item.color} opacity-20`}
      />
    </motion.div>
  );
}

export default function Carousel({
  items = DEFAULT_ITEMS,
  baseWidth = 300,
  cardHeight = 220,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false,
}: CarouselProps): JSX.Element {
  const containerPadding = 16;
  const itemWidth = baseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;

  const itemsForRender = useMemo(() => {
    if (!loop) return items;
    if (items.length === 0) return [];
    return [items[items.length - 1], ...items, items[0]];
  }, [items, loop]);

  const [position, setPosition] = useState<number>(loop ? 1 : 0);
  const x = useMotionValue(-(loop ? 1 : 0) * (baseWidth - 16 * 2 + GAP));
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const prevItemsLengthRef = useRef<number>(items.length);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  useEffect(() => {
    if (!autoplay || itemsForRender.length <= 1) return undefined;
    if (pauseOnHover && isHovered) return undefined;
    const timer = setInterval(() => {
      setPosition((prev) => Math.min(prev + 1, itemsForRender.length - 1));
    }, autoplayDelay);
    return () => clearInterval(timer);
  }, [autoplay, autoplayDelay, isHovered, pauseOnHover, itemsForRender.length]);

  useEffect(() => {
    if (prevItemsLengthRef.current === items.length) return;
    prevItemsLengthRef.current = items.length;
    const startingPosition = loop ? 1 : 0;
    setPosition(startingPosition);
    x.set(-startingPosition * trackItemOffset);
  }, [items.length, loop, trackItemOffset, x]);

  const safePosition =
    !loop && position > itemsForRender.length - 1
      ? Math.max(0, itemsForRender.length - 1)
      : position;

  const effectiveTransition = isJumping ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationStart = () => setIsAnimating(true);

  const handleAnimationComplete = () => {
    if (!loop || itemsForRender.length <= 1) {
      setIsAnimating(false);
      return;
    }
    const lastCloneIndex = itemsForRender.length - 1;
    if (position === lastCloneIndex) {
      setIsJumping(true);
      const target = 1;
      setPosition(target);
      x.set(-target * trackItemOffset);
      requestAnimationFrame(() => {
        setIsJumping(false);
        setIsAnimating(false);
      });
      return;
    }
    if (position === 0) {
      setIsJumping(true);
      const target = items.length;
      setPosition(target);
      x.set(-target * trackItemOffset);
      requestAnimationFrame(() => {
        setIsJumping(false);
        setIsAnimating(false);
      });
      return;
    }
    setIsAnimating(false);
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ): void => {
    const { offset, velocity } = info;
    const direction =
      offset.x < -DRAG_BUFFER || velocity.x < -VELOCITY_THRESHOLD
        ? 1
        : offset.x > DRAG_BUFFER || velocity.x > VELOCITY_THRESHOLD
          ? -1
          : 0;
    if (direction === 0) return;
    setPosition((prev) => {
      const next = prev + direction;
      const max = itemsForRender.length - 1;
      return Math.max(0, Math.min(next, max));
    });
  };

  const dragProps = loop
    ? {}
    : {
        dragConstraints: {
          left: -trackItemOffset * Math.max(itemsForRender.length - 1, 0),
          right: 0,
        },
      };

  const activeIndex =
    items.length === 0
      ? 0
      : loop
        ? (safePosition - 1 + items.length) % items.length
        : Math.min(safePosition, items.length - 1);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden p-4"
      style={{
        width: `${baseWidth}px`,
        height: round ? `${baseWidth}px` : `${cardHeight + 32 + 40}px`,
        borderRadius: round ? '50%' : '20px',
        border: '1px solid rgba(111, 209, 215, 0.1)',
      }}
    >
      <motion.div
        className="flex"
        drag={isAnimating ? false : 'x'}
        {...dragProps}
        style={{
          width: itemWidth,
          gap: `${GAP}px`,
          perspective: 1000,
          perspectiveOrigin: `${safePosition * trackItemOffset + itemWidth / 2}px 50%`,
          x,
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(safePosition * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationStart={handleAnimationStart}
        onAnimationComplete={handleAnimationComplete}
      >
        {itemsForRender.map((item, index) => (
          <CarouselItemCard
            key={`${item?.id ?? index}-${index}`}
            item={item}
            index={index}
            itemWidth={itemWidth}
            cardHeight={cardHeight}
            round={round}
            trackItemOffset={trackItemOffset}
            x={x}
            transition={effectiveTransition}
          />
        ))}
      </motion.div>

      {/* Dot indicators */}
      <div
        className={`flex w-full justify-center ${round ? 'absolute z-20 bottom-12 left-1/2 -translate-x-1/2' : ''}`}
      >
        <div className="mt-4 flex items-center gap-2">
          {items.map((_, index) => (
            <motion.button
              key={index}
              className="rounded-full cursor-pointer transition-colors duration-150"
              style={{
                height: '4px',
                background:
                  activeIndex === index ? '#5df8d8' : 'rgba(111,209,215,0.2)',
              }}
              animate={{
                width: activeIndex === index ? 20 : 6,
                scale: activeIndex === index ? 1 : 1,
              }}
              onClick={() => setPosition(loop ? index + 1 : index)}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
