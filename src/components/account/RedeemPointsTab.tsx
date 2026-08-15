import { useEffect, useState } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle, Coins, Eye, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import redeemService, { type Bill, type Wallet, type Transaction } from '@/services/redeem.service';
import orderService from '@/services/order.service';

interface Props {
  loading: boolean;
}


const RedeemPointsTab = ({ loading }: Props) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionProductNames, setTransactionProductNames] = useState<Record<string, string>>({});
  const [transactionBillCodes, setTransactionBillCodes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'upload' | 'history'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedBillImage, setSelectedBillImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [prevPageUrl, setPrevPageUrl] = useState<string | null>(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (loading) return;
      try {
        setIsLoading(true);
        const [walletData, billsData, transactionsData] = await Promise.all([
          redeemService.getWallet(),
          redeemService.listBills(),
          redeemService.getTransactions(),
        ]);
        setWallet(walletData);
        setBills(billsData);
        setTransactions(transactionsData.results || transactionsData);
        setTotalTransactions(transactionsData.count || transactionsData.length);
        setNextPageUrl(transactionsData.next || null);
        setPrevPageUrl(transactionsData.previous || null);

        // Create a map of bill IDs to bill codes for quick lookup
        const billCodeMap: Record<string, string> = {};
        billsData.forEach(bill => {
          billCodeMap[bill.id] = bill.bill_code;
        });

        // Fetch product names for transactions that have associated orders
        const productNamesMap: Record<string, string> = {};
        const billCodesMap: Record<string, string> = {};
        
        const transactionsList = transactionsData.results || transactionsData;
        const orderPromises = transactionsList
          .filter((transaction: Transaction) => transaction.order && transaction.transaction_type === 'debit')
          .map(async (transaction: Transaction) => {
            try {
              const orderDetail = await orderService.getOrder(transaction.order!);
              const productNames = orderDetail.items.map((item: any) => item.product_name).join(', ');
              productNamesMap[transaction.id] = productNames;
            } catch (error) {
              console.error(`Failed to fetch order details for transaction ${transaction.id}:`, error);
              productNamesMap[transaction.id] = transaction.description;
            }
          });

        // Map bill codes for credit transactions
        transactionsList
          .filter((transaction: Transaction) => transaction.bill_upload && transaction.transaction_type === 'credit')
          .forEach((transaction: Transaction) => {
            if (transaction.bill_upload && billCodeMap[transaction.bill_upload]) {
              billCodesMap[transaction.id] = billCodeMap[transaction.bill_upload];
            }
          });

        await Promise.all(orderPromises);
        setTransactionProductNames(productNamesMap);
        setTransactionBillCodes(billCodesMap);
      } catch (error: any) {
        console.error('Failed to fetch redeem data:', error);
        toast.error('Failed to load redeem points data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [loading]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (imageModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [imageModalOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadBill = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    try {
      setIsUploading(true);
      const uploadedBill = await redeemService.uploadBill(selectedFile);
      setBills([uploadedBill, ...bills]);
      setSelectedFile(null);
      setPreviewUrl(null);
      toast.success('Bill uploaded successfully. Awaiting admin approval.');
      
      // Reset file input
      const fileInput = document.getElementById('bill-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      console.error('Failed to upload bill:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload bill');
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-green-100 text-green-700 text-xs font-medium"><CheckCircle className="w-3 h-3" /> Approved</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-red-100 text-red-700 text-xs font-medium"><AlertCircle className="w-3 h-3" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-yellow-100 text-yellow-700 text-xs font-medium"><Loader2 className="w-3 h-3 animate-spin" /> Pending</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleViewBillImage = (imageUrl: string) => {
    setSelectedBillImage(imageUrl);
    setImageModalOpen(true);
  };

  const getTransactionDisplayText = (transaction: Transaction) => {
    // For debit transactions with orders, show "Point Redeemed for [product names]"
    if (transaction.transaction_type === 'debit' && transaction.order && transactionProductNames[transaction.id]) {
      return `Point Redeemed for ${transactionProductNames[transaction.id]}`;
    }
    
    // For debit transactions without product names (fallback)
    if (transaction.transaction_type === 'debit') {
      return `Point Redeemed for Order`;
    }
    
    // For credit transactions, show "Reward" with bill code if available
    if (transaction.transaction_type === 'credit') {
      if (transactionBillCodes[transaction.id]) {
        return `Reward (Bill: ${transactionBillCodes[transaction.id]})`;
      }
      return 'Reward';
    }
    
    // Fallback to original description for any other cases
    return transaction.description;
  };

  const handlePageChange = async (pageUrl: string | null) => {
    if (!pageUrl) return;
    
    try {
      setIsLoadingTransactions(true);
      
      // Extract page number from URL
      const url = new URL(pageUrl);
      const page = url.searchParams.get('page');
      const pageNum = page ? parseInt(page) : 1;
      
      // Use redeemService with page parameter instead of direct fetch
      const data = await redeemService.getTransactions(pageNum);
      
      setTransactions(data.results || data);
      setTotalTransactions(data.count || data.length);
      setNextPageUrl(data.next || null);
      setPrevPageUrl(data.previous || null);
      setCurrentPage(pageNum);

      // Fetch product names for new transactions
      const productNamesMap: Record<string, string> = {};
      const billCodeMap: Record<string, string> = {};
      
      bills.forEach(bill => {
        billCodeMap[bill.id] = bill.bill_code;
      });

      const transactionsList = data.results || data;
      const orderPromises = transactionsList
        .filter((transaction: Transaction) => transaction.order && transaction.transaction_type === 'debit')
        .map(async (transaction: Transaction) => {
          try {
            const orderDetail = await orderService.getOrder(transaction.order!);
            const productNames = orderDetail.items.map((item: any) => item.product_name).join(', ');
            productNamesMap[transaction.id] = productNames;
          } catch (error) {
            console.error(`Failed to fetch order details for transaction ${transaction.id}:`, error);
            productNamesMap[transaction.id] = transaction.description;
          }
        });

      await Promise.all(orderPromises);
      setTransactionProductNames(productNamesMap);
      
      // Scroll to top of history section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error('Failed to load page:', error);
      toast.error('Failed to load transactions');
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold mb-4">Redeem Points</h2>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-bold">Redeem Points</h2>

      {/* Wallet Balance Card */}
      {wallet && (
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Coins className="w-5 h-5" />
            <p className="text-sm opacity-90">Available Points</p>
          </div>
          <p className="font-display text-3xl font-bold">{wallet.balance.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-2">Use your points to get discounts on purchases</p>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveSubTab('upload')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeSubTab === 'upload'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Upload Bill
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeSubTab === 'history'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          History
        </button>
      </div>

      {/* Upload Bill Section */}
      {activeSubTab === 'upload' && (
        <div className="space-y-4">
          <div className="bg-background rounded-sm p-6 border border-border">
            <h3 className="font-display text-sm font-bold mb-4">Upload Your Bill</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Upload a clear image of your bill to earn points. Our team will verify and approve it within 24 hours.
            </p>

            {/* File Upload Area */}
            <div className="mb-4">
              <label
                htmlFor="bill-upload"
                className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-border rounded-sm cursor-pointer hover:bg-secondary/50 transition-colors"
              >
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, JPEG up to 5MB</p>
                <input
                  id="bill-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="mb-4">
                <p className="text-xs font-medium text-foreground mb-2">Preview:</p>
                <img
                  src={previewUrl}
                  alt="Bill preview"
                  className="max-h-48 rounded-sm border border-border"
                />
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUploadBill}
              disabled={!selectedFile || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Bill
                </>
              )}
            </Button>
          </div>

          {/* Recent Bills */}
          {bills.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-display text-sm font-bold">Recent Bills</h3>
              {bills.slice(0, 3).map((bill) => (
                <div key={bill.id} className="bg-background rounded-sm p-4 border border-border">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Bill #{bill.bill_code}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(bill.created_at)} at {formatTime(bill.created_at)}
                      </p>
                       {/* <p className="text-xs text-muted-foreground">Amount: ₹{bill.bill_amount}</p> */}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div>
                        {getStatusBadge(bill.status)}
                        {bill.status === 'approved' && bill.points_awarded && (
                          <p className="text-xs font-semibold text-green-600 mt-2">+{bill.points_awarded} pts</p>
                        )}
                      </div>
                      {bill.bill_image && (
                        <button
                          onClick={() => handleViewBillImage(bill.bill_image)}
                          className="p-1.5 rounded-sm hover:bg-secondary transition-colors"
                          aria-label="View bill image"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </button>
                      )}
                    </div>
                  </div>
                  {bill.admin_notes && (
                    <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                      {bill.admin_notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Section */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          <h3 className="font-display text-sm font-bold">Transaction History</h3>
          {transactions.length > 0 ? (
            <>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="bg-background rounded-sm p-4 border border-border">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{getTransactionDisplayText(transaction)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(transaction.created_at)} at {formatTime(transaction.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.transaction_type === 'credit' ? '+' : '-'}{transaction.points}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Balance: {transaction.balance_after}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Total: {totalTransactions} transactions
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(prevPageUrl)}
                    disabled={!prevPageUrl || isLoadingTransactions}
                    className="px-3 py-2 text-xs font-medium border border-border rounded-sm hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 text-xs font-medium text-muted-foreground">
                    Page {currentPage}
                  </span>
                  <button
                    onClick={() => handlePageChange(nextPageUrl)}
                    disabled={!nextPageUrl || isLoadingTransactions}
                    className="px-3 py-2 text-xs font-medium border border-border rounded-sm hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoadingTransactions ? 'Loading...' : 'Next'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-background rounded-sm p-8 text-center border border-border">
              <Coins className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No transactions yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Image Modal */}
      {imageModalOpen && selectedBillImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50">
          <div className="bg-background rounded-sm shadow-2xl max-w-2xl w-full mx-4 max-h-[60vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background">
              <h3 className="font-display text-sm font-bold">Bill Image</h3>
              <button
                onClick={() => {
                  setImageModalOpen(false);
                  setSelectedBillImage(null);
                }}
                className="p-1 hover:bg-secondary rounded-sm transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center">
              <img
                src={selectedBillImage}
                alt="Bill"
                className="max-w-full h-auto rounded-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RedeemPointsTab;
