import { useState, useEffect } from "react";
import { Trash2, Eye, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";

const Services = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch services with category and business listing info
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select(`
          *,
          category:categories(name),
          business_listing:business_listings(business_name, status)
        `)
        .order('created_at', { ascending: false });

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch categories for filter
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async () => {
    if (!deleteServiceId) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', deleteServiceId);

      if (error) throw error;

      toast({ title: "Service deleted successfully" });
      fetchData();
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete service.",
        variant: "destructive",
      });
    } finally {
      setDeleteServiceId(null);
    }
  };

  const filteredServices = services.filter(service => {
    if (filterStatus !== "all" && service.active !== (filterStatus === "active")) {
      return false;
    }
    if (filterCategory !== "all" && service.category_id !== filterCategory) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Manage Services | Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Services</h2>
          <p className="text-muted-foreground">Manage all platform services</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services List */}
        <Card>
          <CardHeader>
            <CardTitle>
              All Services ({filteredServices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredServices.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No services found</p>
            ) : (
              <div className="space-y-4">
                {filteredServices.map((service) => (
                  <div key={service.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-lg">{service.title}</h3>
                          <Badge variant={service.active ? "default" : "secondary"}>
                            {service.active ? "Active" : "Inactive"}
                          </Badge>
                          {service.is_featured && (
                            <Badge className="bg-gradient-primary text-white">Featured</Badge>
                          )}
                          {service.is_verified && (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                              Verified
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Category:</span> {service.category?.name || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Location:</span> {service.location}
                          </div>
                          {service.price_from && (
                            <div>
                              <span className="font-medium">Price:</span> ${service.price_from}+
                            </div>
                          )}
                        </div>

                        {service.business_listing && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Business: </span>
                            <span className="font-medium">{service.business_listing.business_name}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {service.business_listing.status}
                            </Badge>
                          </div>
                        )}

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {service.description}
                        </p>

                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>Rating: {service.rating}/5</span>
                          <span>•</span>
                          <span>{service.review_count} reviews</span>
                          <span>•</span>
                          <span>Created: {new Date(service.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedService(service)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteServiceId(service.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteServiceId} onOpenChange={() => setDeleteServiceId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteServiceId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteService}>
              Delete Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Details Dialog */}
      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Service Details</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedService.title}</h3>
                <div className="flex gap-2 mt-2">
                  <Badge variant={selectedService.active ? "default" : "secondary"}>
                    {selectedService.active ? "Active" : "Inactive"}
                  </Badge>
                  {selectedService.is_featured && <Badge>Featured</Badge>}
                  {selectedService.is_verified && <Badge variant="outline">Verified</Badge>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <p className="font-medium">{selectedService.category?.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <p className="font-medium">{selectedService.location}</p>
                </div>
                {selectedService.address && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Address:</span>
                    <p className="font-medium">{selectedService.address}</p>
                  </div>
                )}
                {selectedService.price_from && (
                  <div>
                    <span className="text-muted-foreground">Starting Price:</span>
                    <p className="font-medium">${selectedService.price_from} {selectedService.price_unit}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Rating:</span>
                  <p className="font-medium">{selectedService.rating}/5 ({selectedService.review_count} reviews)</p>
                </div>
                {selectedService.capacity_min && (
                  <div>
                    <span className="text-muted-foreground">Min Capacity:</span>
                    <p className="font-medium">{selectedService.capacity_min}</p>
                  </div>
                )}
                {selectedService.capacity_max && (
                  <div>
                    <span className="text-muted-foreground">Max Capacity:</span>
                    <p className="font-medium">{selectedService.capacity_max}</p>
                  </div>
                )}
              </div>

              <div>
                <span className="text-muted-foreground text-sm">Description:</span>
                <p className="mt-1">{selectedService.description}</p>
              </div>

              {selectedService.amenities && selectedService.amenities.length > 0 && (
                <div>
                  <span className="text-muted-foreground text-sm">Amenities:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedService.amenities.map((amenity: string, idx: number) => (
                      <Badge key={idx} variant="outline">{amenity}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedService.business_listing && (
                <div className="pt-4 border-t">
                  <span className="text-muted-foreground text-sm">Associated Business:</span>
                  <p className="font-medium mt-1">{selectedService.business_listing.business_name}</p>
                  <Badge variant="outline" className="mt-1">
                    {selectedService.business_listing.status}
                  </Badge>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedService(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Services;
