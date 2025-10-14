def export_to_csv(self, filename: str = "expenses_export.csv"):
        """ 
        Export to CSV file in ONE LINE
        
        """
        df = self.get_dataframe()
        df.to_csv(filename, index=False)
        print(f"Exported {len(df)} expenses to '{filename}'")
        print("You can open this file with Google Sheets or Excel or anything that can view a csv file")
    
    def view_expenses(self):
        """ allows us to view expenses """

        df = self.get_dataframe()

        if df.empty:
            print("no expenses recorded")
            return
        print(f"\n Your expenses ({len(df)}) total: ")
        print("="*100)

    def spending_by_category(self):
        df = self.get_dataframe

        if df.empty:
            print(" no data to analyze ")
            return 
        
        print("PRINT SPENDING BY CATEGORY")

        print("*"*70)

        category_summary = df.groupby('category')['amount'].agg([
            ('Total', 'sum'),
            ('Count', 'count'),
            ('Average', 'mean')
        ]).sort_values('Total', ascending=False)

        category_summary['Average'] = category_summary['Average'].round(2)

        print(category_summary)
        print("*"*70)

        return category_summary
    
    def filter_by_category(self, category: str):
        """ filtering works by "masking" with True/False
         for example 
          df[df['amount'] > 50 ]

         df[df['category'] == 'food'] 
            """
        df = self.get_dataframe()

        mask = df['category'] == category.lower()
        filtered = df[mask]

        if filtered.empty:
            print(f"No expenses found in category {category}")
            return None
        print(f"Expenses in {category.upper()}")
        print("*"*70)
                  
        display = filtered(['date', 'description', 'amount'])
        print(display.to_string(index=False))

        print(f"\n Total in {category}: ${filtered['amount'].sum():,.2f}")
        print(f" Count: {len(filtered)} expenses")
        print(f"Average: ${filtered['amount'].mean():.2f}")
        print("="*100)

    def summary_statistics(self):
        """
        Pandas gives us powerful and ready to go statistics on our data
        """

        df = self.get_dataframe()

        if df.empty:
            print("no data to analyze")

        print("\n SUMMARY STATISTICS")
        print("=" * 50)
        print(df['amount'].describe())


        # no we are reading from our DB
        # cursor = self.connection.cursor()
        # cursor.execute('SELECT date, description, amount, category, currency FROM expenses')
        # rows = cursor.fetchall()

        # if not rows:
        #     print("No expenses recorded")
        #     return
        
        # print(f"\n📋 Your expenses ({len(rows)} total):")
        # print("=" * 80)
        # for row in rows:
        #     expense = Expense(row[1], row[2], row[3], row[4], row[0])
        #     print(expense)

        # if not self.expenses:
        #    print("no expenses recorded")
        #    return 

        # #sorted_expenses = sorted(self.expenses)   
        # expenses = self.expenses

        # print(f"\n Your expenses ({len(expenses)} total):")
        # print("="*65)
        # for expense in expenses:
        #     print(expense)

if __name__ == "__main__":
    print("="*65)
    print("TESTING OUR EXPENSE TRACKER WITH SQLITE3")
    print("="*65)

    tracker = SimpleExpenseTracker("test_expenses.db")
    # tracker.add_expense("coffee", 4.00, "food")
    # tracker.add_expense("gas", 24.00, "transportation")
    # tracker.add_expense("lunch", 10.00, "food")
    print("let's see what's in our database")
    tracker.view_expenses()
    tracker.summary_statistics()
    tracker.export_to_csv()
    print("="*65)
    tracker.close()