#include "optimal.h"
#include <stdio.h>
#include <stdlib.h>

int optimal(int frames, int pages[], int n) {
    int *memory = (int *)malloc(frames * sizeof(int));
    int page_faults = 0;

    for (int i = 0; i < frames; i++) {
        memory[i] = -1; // Initialize memory frames
    }

    for (int i = 0; i < n; i++) {
        int page = pages[i];
        int found = 0;

        // Check if page is already in memory
        for (int j = 0; j < frames; j++) {
            if (memory[j] == page) {
                found = 1;
                break;
            }
        }

        // If page is not in memory, replace the page that won't be used for the longest time
        if (!found) {
            int replace_index = -1;
            int farthest = i + 1;

            for (int j = 0; j < frames; j++) {
                int k;
                for (k = i + 1; k < n; k++) {
                    if (memory[j] == pages[k]) {
                        if (k > farthest) {
                            farthest = k;
                            replace_index = j;
                        }
                        break;
                    }
                }
                if (k == n) {
                    replace_index = j;
                    break;
                }
            }

            if (replace_index == -1) {
                replace_index = 0;
            }

            memory[replace_index] = page;
            page_faults++;
        }
    }

    free(memory);
    return page_faults;
}