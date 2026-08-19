import {
  type SimulationFormData,
  type SimulationRecord,
} from '@/data/simulation'

const LOCAL_STORAGE_KEY = 'simulation-data'

export const useSimulationStorage = () => {
  const getSavedData = () => {
    const storage = localStorage.getItem(LOCAL_STORAGE_KEY)

    if (!storage) {
      return []
    }

    const savedData = JSON.parse(storage) as SimulationRecord[]
    const migratedData: SimulationRecord[] = savedData.map((record) => ({
      ...record,
      createdAt: record.createdAt ?? new Date().toISOString(),
    }))

    if (
      migratedData.some(
        (record, index) => record.createdAt !== savedData[index].createdAt,
      )
    ) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(migratedData))
    }

    return migratedData
  }

  const saveFormData = (formData: SimulationFormData) => {
    const id = crypto.randomUUID()
    const record: SimulationRecord = {
      ...formData,
      id,
      createdAt: new Date().toISOString(),
    }

    const storage = localStorage.getItem(LOCAL_STORAGE_KEY)
    const savedData = storage ? (JSON.parse(storage) as SimulationRecord[]) : []

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify([...savedData, record]),
    )

    return id
  }

  const getFormData = (id: string) => {
    const savedData = getSavedData()
    return savedData.find((record) => record.id === id) || null
  }

  const getAllFormData = () => {
    return getSavedData()
  }

  const deleteSimulation = (id: string) => {
    const savedData = getAllFormData()
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(savedData.filter((record) => record.id !== id)),
    )
  }

  const updateSimulation = (id: string, data: SimulationRecord) => {
    const savedData = getSavedData()

    const updated = savedData.map((record) =>
      record.id === id ? { ...data } : record,
    )

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
  }

  return {
    saveFormData,
    getFormData,
    getAllFormData,
    deleteSimulation,
    updateSimulation,
  }
}
