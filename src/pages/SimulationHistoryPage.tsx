import { Eye, Goal, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/shared/Button'
import { PageHero } from '@/components/shared/PageHero'
import type { SimulationRecord } from '@/data/simulation'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'
import { calcMonthlySavings } from '@/utils/simulation'

function formatCreatedAt(createdAt?: string) {
  if (!createdAt) {
    return 'Data não registrada'
  }

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(new Date(createdAt))
  const formattedTime = new Intl.DateTimeFormat('pt-BR', {
    timeStyle: 'short',
  }).format(new Date(createdAt))

  return `${formattedDate} às ${formattedTime}`
}

export function SimulationHistoryPage() {
  const navigate = useNavigate()
  const { getAllFormData, deleteSimulation } = useSimulationStorage()
  const [simulations, setSimulations] = useState<SimulationRecord[]>(() =>
    getAllFormData().reverse(),
  )

  const handleDelete = (id: string) => {
    deleteSimulation(id)
    setSimulations((current) =>
      current.filter((simulation) => simulation.id !== id),
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <PageHero
        title="Histórico de simulações"
        subtitle="Consulte suas metas e retome qualquer planejamento salvo."
      />

      {simulations.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 text-center shadow-[4px_4px_18px_0px_rgba(0,0,0,0.2)]">
          <Goal className="text-primary mx-auto mb-3" size={32} />
          <h2 className="text-foreground text-xl font-semibold">
            Nenhuma simulação cadastrada
          </h2>
          <p className="text-muted-foreground mt-2">
            Crie sua primeira meta para acompanhar o planejamento por aqui.
          </p>
          <Button
            variant="primary"
            onClick={() => void navigate('/')}
            className="mx-auto mt-6"
          >
            Nova simulação
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {simulations.map((simulation) => (
            <article
              key={simulation.id}
              className="bg-card flex flex-col gap-5 rounded-2xl p-5 shadow-[4px_4px_18px_0px_rgba(0,0,0,0.12)] md:flex-row md:items-center md:gap-6 md:px-6 md:py-4"
            >
              <div className="flex min-w-0 items-center gap-4 md:w-52 md:shrink-0">
                <div className="bg-muted-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-lg">
                  <Goal size={23} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-foreground truncate text-sm font-semibold">
                    {simulation.goalName}
                  </h2>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {formatCreatedAt(simulation.createdAt)}
                  </p>
                </div>
              </div>

              <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3 md:gap-6">
                <div>
                  <div className="text-primary text-[10px] font-semibold tracking-wider uppercase">
                    Custo da meta
                  </div>
                  <p className="text-foreground mt-1 text-sm font-semibold">
                    R$ {simulation.goalAmount}
                  </p>
                </div>
                <div>
                  <div className="text-primary text-[10px] font-semibold tracking-wider uppercase">
                    Prazo
                  </div>
                  <p className="text-foreground mt-1 text-sm font-semibold">
                    {simulation.goalDeadline} meses
                  </p>
                </div>
                <div>
                  <div className="text-primary text-[10px] font-semibold tracking-wider uppercase">
                    Economia mensal
                  </div>
                  <p className="text-foreground mt-1 text-sm font-semibold">
                    R${' '}
                    {calcMonthlySavings(simulation).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              <div className="border-border flex items-center justify-between gap-3 border-t pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-6">
                <Button
                  variant="ghost"
                  icon={Eye}
                  onClick={() => void navigate(`/resultado/${simulation.id}`)}
                  className="order-2 px-2 py-2 text-xs md:order-1"
                >
                  Ver detalhes
                </Button>
                <Button
                  variant="ghost"
                  icon={Trash2}
                  aria-label={`Excluir simulação ${simulation.goalName}`}
                  onClick={() => handleDelete(simulation.id)}
                  className="order-1 px-2 py-2 text-red-500 hover:text-red-600 md:order-2"
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
