namespace SimplerDesigns.DataService
{
    public class AccountingEntry
    {
        public int Month { get; set; }
        public double Revenue { get; set; }
        public int OrderCount { get; set; }
        public double AverageRevenue => OrderCount > 0 ? Revenue / OrderCount : 0;
    }

    public class AccountingSummary
    {
        public int Year { get; set; }
        public int? Month { get; set; }
        public double TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
        public double AverageRevenue => TotalOrders > 0 ? TotalRevenue / TotalOrders : 0;
        public List<AccountingEntry> Entries { get; set; } = new();
    }
}
