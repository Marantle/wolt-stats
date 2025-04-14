# **Project Requirements Document: Wolt Stats Website**

The following table outlines the detailed functional requirements of the Wolt Stats Website.

**Note**:  
- Input file: `./public/wolt_order_dump.json`  
- Type definitions: `woltorder.d.ts`  
- Charts library up to your discretion
- tailwindcss for astro is already set up
---

## Functional Requirements

| Requirement ID | Description                              | User Story                                                                                                 | Expected Behavior/Outcome                                                                                                     |
|----------------|------------------------------------------|------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| FR000          | Beautiful modern theme                   | As a user, I want to seesee a buautiful modern design on this website                                          | The system should setup a beautiful theme with tailwind                                                              |
| FR001          | Parse order dump                         | As a user, I want to see the values in the files parsed into JSON                                          | The system should read the file and parse its values accordingly                                                              |
| FR002          | Monthly order count chart                | As a user, I want to see how many orders I placed each month                                               | The system reads the JSON file and renders a bar or line chart showing number of orders per month                            |
| FR003          | Monthly spending chart                   | As a user, I want to see how much I spent each month                                                       | The system reads the JSON file and renders a chart of monthly total spending                                                  |
| FR004          | Top venues by order count                | As a user, I want to see which places I order from the most                                                | A list or chart showing venue names sorted by number of orders                                                                |
| FR005          | Top venues by total spent                | As a user, I want to know where I’ve spent the most money                                                  | A list or chart of venue names sorted by total euro amount spent                                                              |
| FR006          | Average order value over time            | As a user, I want to see how my average order size has changed                                             | A line graph showing average total_amount per month                                                                           |
| FR007          | Total spent all time                     | As a user, I want to see how much I’ve spent in total                                                      | A simple summary showing cumulative euro amount of all orders                                                                 |
| FR008          | Busiest days of the week                 | As a user, I want to know which weekdays I usually order on                                                | A bar chart showing distribution of orders across weekdays                                                                    |
| FR009          | Favorite items                           | As a user, I want to see which products I’ve ordered the most frequently                                   | A list of most frequently appearing individual item strings, sorted by frequency                                              |
| FR010          | Longest order streak                     | As a user, I want to know what’s the longest streak of days I ordered without a break                      | Display the maximum streak of consecutive days with at least one order                                                        |
| FR011          | Order heatmap                            | As a user, I want to see a calendar heatmap of how often I ordered                                         | Render a calendar-style heatmap where each day is shaded based on number of orders                                            |
| FR012          | Order time histogram                     | As a user, I want to see at what times of day I usually order                                              | Histogram that groups orders by time-of-day (morning, lunch, afternoon, evening, night)                                       |
| FR013          | Monthly unique items                     | As a user, I want to see how many unique items I try per month                                             | A line chart showing number of unique item strings per month                                                                  |

