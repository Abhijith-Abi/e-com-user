import { useWarehouses } from '@/hooks/useWarehouses';
import { useSettingsStore } from '@/store/useSettingsStore';

const WarehouseList = () => {
  const { warehouses, loading, error } = useWarehouses();

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <p className="font-sans text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-20 text-center">
        <p className="font-sans text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-display mb-8">Warehouses</h1>
      
      <div className="space-y-4">
        {warehouses.map((warehouse) => (
          <div
            key={warehouse.id}
            className="border border-border rounded-lg p-6 bg-background"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-display mb-2">{warehouse.name}</h2>
                {warehouse.code && (
                  <p className="text-sm font-sans text-muted-foreground mb-1">
                    Code: {warehouse.code}
                  </p>
                )}
                <p className="text-xs font-mono text-muted-foreground mb-3">
                  ID: {warehouse.id}
                </p>
                
                {(warehouse.address || warehouse.city || warehouse.country) && (
                  <div className="text-sm font-sans text-muted-foreground">
                    {warehouse.address && <p>{warehouse.address}</p>}
                    <p>
                      {[warehouse.city, warehouse.state, warehouse.postal_code]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    {warehouse.country && <p>{warehouse.country}</p>}
                  </div>
                )}
              </div>
              
              <span
                className={`px-3 py-1 text-xs font-sans rounded-full ${
                  warehouse.is_active
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }`}
              >
                {warehouse.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {warehouses.length === 0 && (
        <p className="text-center text-muted-foreground font-sans">
          No warehouses found
        </p>
      )}
    </div>
  );
};

export default WarehouseList;
