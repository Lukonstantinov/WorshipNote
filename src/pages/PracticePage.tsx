import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Sparkles, Mic, Piano, ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PageHeader } from '../shared/components/PageHeader'
import { alpha } from '../shared/lib/color'

interface Tool {
  to: string
  title: string
  desc: string
  Icon: LucideIcon
  from: string
  to2: string
}

export default function PracticePage() {
  const { t } = useTranslation()

  const TOOLS: Tool[] = [
    { to: '/pitch', title: t('pitchDetection'), desc: t('tunerDesc'), Icon: Mic, from: '#f97316', to2: '#facc15' },
    { to: '/piano-learn', title: t('pianoTrainer'), desc: t('pianoTrainerDesc'), Icon: Piano, from: '#ec4899', to2: '#8b5cf6' },
  ]

  return (
    <div className="p-4 pb-8 max-w-3xl mx-auto">
      <PageHeader title={t('practice')} subtitle={t('practiceSubtitle')} Icon={Sparkles} color="practice" />
      <div className="grid gap-4 sm:grid-cols-2">
        {TOOLS.map(({ to, title, desc, Icon, from, to2 }) => (
          <Link
            key={to}
            to={to}
            className="card-lift relative overflow-hidden rounded-3xl p-5 flex flex-col gap-4 active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${from} 0%, ${to2} 100%)`,
              color: '#fff',
              minHeight: 170,
              boxShadow: `0 10px 28px ${alpha(from, 35)}`,
            }}
          >
            {/* decorative circles */}
            <span className="absolute -right-8 -top-8 rounded-full" style={{ width: 140, height: 140, background: 'rgba(255,255,255,0.15)' }} />
            <span className="absolute right-10 -bottom-10 rounded-full" style={{ width: 90, height: 90, background: 'rgba(255,255,255,0.1)' }} />
            <span
              className="relative flex items-center justify-center rounded-2xl"
              style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.22)' }}
            >
              <Icon size={28} strokeWidth={2} />
            </span>
            <div className="relative flex items-end gap-2">
              <div className="flex-1">
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-sm mt-1" style={{ opacity: 0.9 }}>{desc}</p>
              </div>
              <ChevronRight size={22} strokeWidth={2.5} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
