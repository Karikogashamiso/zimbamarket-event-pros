import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  getPageNumbers: () => number[];
  showPageInfo?: boolean;
  totalItems?: number;
  startIndex?: number;
  endIndex?: number;
}

export const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  canGoNext,
  canGoPrevious,
  getPageNumbers,
  showPageInfo = true,
  totalItems = 0,
  startIndex = 0,
  endIndex = 0,
}: PaginationControlsProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      {showPageInfo && totalItems > 0 && (
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1}-{endIndex} of {totalItems} results
        </p>
      )}
      
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!canGoPrevious}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
          </PaginationItem>

          {getPageNumbers().map((pageNum, index) => (
            <PaginationItem key={`${pageNum}-${index}`}>
              {pageNum === -1 ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  isActive={pageNum === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(pageNum);
                  }}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!canGoNext}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
